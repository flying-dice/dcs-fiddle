/**
 * Builds the Lua command used by the explorer. It inspects the addressed
 * table, summarising every entry as either its primitive value, a
 * `function name(args)` signature, or its type name, then encodes the
 * summary to JSON (DCS has no consistent JSON API across environments).
 */
export const getExploreCommand = (item: string) => `
function getArgs(fun)
    local args = {}
    local hook = debug.gethook()

    local argHook = function( ... )
        local info = debug.getinfo(3)
        if 'pcall' ~= info.name then return end

        for i = 1, math.huge do
            local name, value = debug.getlocal(2, i)
            if '(*temporary)' == name then
                debug.sethook(hook)
                error('')
                return
            end
            table.insert(args,name)
        end
    end

    debug.sethook(argHook, "c")
    pcall(fun)

    return args
end


local function getMeta (data)
    local meta = {}

    for k,v in pairs(data) do
        local t = type(v)

        if t == 'string' or t == 'number' or t == 'nil' or t == 'boolean' then
            meta[k] = v
        elseif t == 'function' then
            meta[k] = t..' '..k..'('..table.concat(getArgs(v), ', ')..')'
        else
            meta[k] = t
        end
    end
    return meta
end

local meta = getMeta(${item})

-------------------------------------------------------------------------------
-- Encode to JSON as no consistent API and some targets missing API all together
-------------------------------------------------------------------------------

local encode

local escape_char_map = {
  [ "\\\\" ] = "\\\\",
  [ "\\"" ] = "\\"",
  [ "\\b" ] = "b",
  [ "\\f" ] = "f",
  [ "\\n" ] = "n",
  [ "\\r" ] = "r",
  [ "\\t" ] = "t",
}

local escape_char_map_inv = { [ "/" ] = "/" }
for k, v in pairs(escape_char_map) do
  escape_char_map_inv[v] = k
end


local function escape_char(c)
  return "\\\\" .. (escape_char_map[c] or string.format("u%04x", c:byte()))
end


local function encode_nil(val)
  return "null"
end


-- Returns true only when every key is a number forming a 1..n sequence.
local function is_table_array(val)
  if rawget(val, 1) ~= nil or next(val) == nil then
    local keys = {}
    for k in pairs(val) do
      if type(k) == "number" then
        table.insert(keys, k)
      else
        return false
      end
    end
    table.sort(keys)
    for i, k in ipairs(keys) do
      if i ~= k then
        return false
      end
    end
    return true
  else
    return false
  end
end


local function encode_table(val, stack)
  local res = {}
  stack = stack or {}

  -- Circular reference?
  if stack[val] then error("circular reference") end

  stack[val] = true

  if is_table_array(val) then
    -- Treat as an array
    for i, v in ipairs(val) do
      table.insert(res, encode(v, stack))
    end
    stack[val] = nil
    return "[" .. table.concat(res, ",") .. "]"

  else
    -- Treat as an object. Mixed/numeric keys are prefixed with "_" so the
    -- output is valid JSON, matching the server's fiddlejson encoder. DCS
    -- tables routinely mix numeric and string keys (e.g. {[1]=x, name=y}),
    -- so the previous strict encoder errored on them. The frontend reverses
    -- this prefix when building drill-down addresses.
    for k, v in pairs(val) do
      if type(k) ~= "string" then
        table.insert(res, encode("_"..k, stack) .. ":" .. encode(v, stack))
      else
        table.insert(res, encode(k, stack) .. ":" .. encode(v, stack))
      end
    end
    stack[val] = nil
    return "{" .. table.concat(res, ",") .. "}"
  end
end


local function encode_string(val)
  return '"' .. val:gsub('[%z\\1-\\31\\\\"]', escape_char) .. '"'
end


local function encode_number(val)
  -- Check for NaN, -inf and inf
  if val ~= val or val <= -math.huge or val >= math.huge then
    error("unexpected number value '" .. tostring(val) .. "'")
  end
  return string.format("%.14g", val)
end


local type_func_map = {
  [ "nil"     ] = encode_nil,
  [ "table"   ] = encode_table,
  [ "string"  ] = encode_string,
  [ "number"  ] = encode_number,
  [ "boolean" ] = tostring,
}


encode = function(val, stack)
  local t = type(val)
  local f = type_func_map[t]
  if f then
    return f(val, stack)
  end
  error("unexpected type '" .. t .. "'")
end

return encode(meta)
`;
