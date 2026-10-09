--[[
Regression test for the server hook's version reporting (issue #21), run with
Lua 5.1 (the DCS Lua version):

    lua5.1 tests/lua/hook-version.spec.lua

Loads the real public/dcs-fiddle-server.lua with DCS and LuaSocket mocked,
then drives requests through its actual HTTP parsing, base64 decoding, request
execution, JSON serialization and response path.

The GUI arrangement models DCS loading each Hooks script into an isolated
environment (globals fall through to _G via __index). Commands run in the
default env are compiled with loadstring and so execute in the thread-global
environment, which cannot see the hook's own globals: the version must come
from the server itself, not from a Lua query.
]]--

local HOOK = "public/dcs-fiddle-server.lua"
local CONFIG = "src/lib/config.ts"

local function read_file(path)
    local f = assert(io.open(path, "rb"))
    local s = f:read("*a")
    f:close()
    return s
end

local expected_version = read_file(CONFIG):match('expectedServerVersion:%s*"([^"]+)"')
assert(expected_version, "could not read expectedServerVersion from " .. CONFIG)

-- base64 encoder for request paths
local B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
local function b64encode(s)
    return ((s:gsub(".", function(c)
        local byte, bits = c:byte(), ""
        for i = 8, 1, -1 do
            bits = bits .. (byte % 2 ^ i - byte % 2 ^ (i - 1) > 0 and "1" or "0")
        end
        return bits
    end) .. "0000"):gsub("%d%d%d?%d?%d?%d?", function(bits)
        if #bits < 6 then return "" end
        local n = 0
        for i = 1, 6 do
            n = n + (bits:sub(i, i) == "1" and 2 ^ (6 - i) or 0)
        end
        return B64:sub(n + 1, n + 1)
    end) .. ({ "", "==", "=" })[#s % 3 + 1])
end

------------------------------------------------------------------------------------------------------------------------
--- Mocks
------------------------------------------------------------------------------------------------------------------------

local pending -- request line the next accept() delivers

local function make_client(request_line)
    local client = { sent = nil }
    function client:settimeout() end
    function client:receive() return request_line end
    function client:send(data) self.sent = data; return #data end
    function client:close() end
    return client
end

local last_client
package.preload["socket"] = function()
    return {
        bind = function(address, port)
            local server = { port = port }
            function server:settimeout() end
            function server:getsockname() return address, port end
            function server:accept()
                if not pending then return nil end
                last_client = make_client(pending)
                pending = nil
                return last_client
            end
            return server
        end,
    }
end

local function quiet() end
_G.log = { debug = quiet, info = quiet, error = quiet }
_G.print = quiet

------------------------------------------------------------------------------------------------------------------------
--- Request helpers
------------------------------------------------------------------------------------------------------------------------

local function parse_response(raw)
    local head, body = raw:match("^(.-)\r\n\r\n(.*)$")
    local lines = {}
    for line in (head .. "\r\n"):gmatch("(.-)\r\n") do
        table.insert(lines, line)
    end
    local status = tonumber(lines[1]:match("^HTTP/1%.1 (%d+)"))
    local headers = {}
    for i = 2, #lines do
        local name, value = lines[i]:match("^([^:]+): (.*)$")
        headers[name:lower()] = value
    end
    return { status = status, headers = headers, body = body }
end

--- Sends `command` through the hook's server loop and returns the parsed response.
local function request(loop, command, env)
    pending = "GET /" .. b64encode(command) .. "?env=" .. (env or "default") .. " HTTP/1.1"
    last_client = nil
    loop()
    assert(last_client and last_client.sent, "server did not respond")
    return parse_response(last_client.sent)
end

------------------------------------------------------------------------------------------------------------------------
--- Loading arrangements
------------------------------------------------------------------------------------------------------------------------

--- GUI: the hook runs in an isolated environment in the GUI state.
local function load_gui_hook()
    local callbacks
    local hook_env = setmetatable({
        DCS = { setUserCallbacks = function(cb) callbacks = cb end },
        lfs = { writedir = function() return "C:\\Saved Games\\DCS\\" end },
        net = {
            dostring_in = function(state, code)
                return "dostring_in:" .. state, false
            end,
        },
    }, { __index = _G })
    local chunk = assert(loadfile(HOOK))
    setfenv(chunk, hook_env)
    chunk()
    assert(callbacks and callbacks.onSimulationFrame, "hook did not register callbacks")
    return callbacks.onSimulationFrame, hook_env
end

--- Mission: the hook is dofile'd into the mission scripting environment.
local function load_mission_hook()
    local scheduled
    local mission_env = setmetatable({
        timer = {
            getTime = function() return 0 end,
            scheduleFunction = function(fn) scheduled = fn end,
        },
        env = { info = quiet, error = quiet },
    }, { __index = _G })
    local chunk = assert(loadfile(HOOK))
    setfenv(chunk, mission_env)
    chunk()
    assert(scheduled, "hook did not schedule its server loop")
    return function() scheduled(nil, 0) end, mission_env
end

------------------------------------------------------------------------------------------------------------------------
--- Tests
------------------------------------------------------------------------------------------------------------------------

local failures, passed = 0, 0
local function test(name, fn)
    local ok, err = pcall(fn)
    if ok then
        passed = passed + 1
        io.stdout:write("ok   - " .. name .. "\n")
    else
        failures = failures + 1
        io.stdout:write("FAIL - " .. name .. "\n       " .. tostring(err) .. "\n")
    end
end

local function eq(actual, expected, what)
    if actual ~= expected then
        error(string.format("%s: expected %q, got %q", what, tostring(expected), tostring(actual)), 2)
    end
end

local gui_loop, gui_env = load_gui_hook()

test("GUI hook's version is isolated from the thread-global environment", function()
    eq(rawget(gui_env, "fiddle_server_version"), expected_version, "hook env version")
    eq(rawget(_G, "fiddle_server_version"), nil, "thread-global version")
end)

test("GUI Lua version query cannot see the hook's version (the original defect)", function()
    local res = request(gui_loop, 'return tostring(fiddle_server_version or "")')
    eq(res.body, '{"result":""}', "body")
end)

test("GUI health check reports the hook version in a response header", function()
    local res = request(gui_loop, 'return "UP"')
    eq(res.status, 200, "status")
    eq(res.body, '{"result":"UP"}', "body")
    eq(res.headers["x-dcs-fiddle-version"], expected_version, "version header")
end)

test("GUI version header is exposed to cross-origin callers", function()
    local res = request(gui_loop, 'return "UP"')
    eq(res.headers["access-control-allow-origin"], "*", "allow origin")
    eq(res.headers["access-control-expose-headers"], "X-DCS-Fiddle-Version", "expose headers")
end)

test("GUI version header is independent of the selected state", function()
    local res = request(gui_loop, 'return "UP"', "mission")
    eq(res.status, 200, "status")
    eq(res.body, '{"result":"dostring_in:mission"}', "body")
    eq(res.headers["x-dcs-fiddle-version"], expected_version, "version header")
end)

test("GUI version header is sent on failed commands too", function()
    local res = request(gui_loop, 'error("boom")')
    eq(res.status, 500, "status")
    eq(res.headers["x-dcs-fiddle-version"], expected_version, "version header")
end)

test("GUI user commands still execute in the thread-global environment", function()
    _G.fiddle_scope_marker = "thread-global"
    rawset(gui_env, "fiddle_scope_marker", "hook")
    local res = request(gui_loop, "return fiddle_scope_marker")
    _G.fiddle_scope_marker = nil
    eq(res.body, '{"result":"thread-global"}', "body")
end)

local mission_loop = load_mission_hook()

test("Mission health check reports the hook version in a response header", function()
    local res = request(mission_loop, 'return "UP"')
    eq(res.status, 200, "status")
    eq(res.body, '{"result":"UP"}', "body")
    eq(res.headers["x-dcs-fiddle-version"], expected_version, "version header")
end)

io.stdout:write(string.format("\n%d passed, %d failed\n", passed, failures))
os.exit(failures == 0 and 0 or 1)
