import { useState } from "react";
import axios from "axios";
import { showNotification } from "@mantine/notifications";
import { useEnvironment } from "../context/environment";

const getCommand = (item) => `
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


local function encode_table(val, stack)
  local res = {}
  stack = stack or {}

  -- Circular reference?
  if stack[val] then error("circular reference") end

  stack[val] = true

  if rawget(val, 1) ~= nil or next(val) == nil then
    -- Treat as array -- check keys are valid and it is not sparse
    local n = 0
    for k in pairs(val) do
      if type(k) ~= "number" then
        error("invalid table: mixed or invalid key types")
      end
      n = n + 1
    end
    if n ~= #val then
      error("invalid table: sparse array")
    end
    -- Encode
    for i, v in ipairs(val) do
      table.insert(res, encode(v, stack))
    end
    stack[val] = nil
    return "[" .. table.concat(res, ",") .. "]"

  else
    -- Treat as an object
    for k, v in pairs(val) do
      if type(k) ~= "string" then
        error("invalid table: mixed or invalid key types")
      end
      table.insert(res, encode(k, stack) .. ":" .. encode(v, stack))
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

export const useExplorer = (item) => {
  const { environment } = useEnvironment();
  const [fetching, setFetching] = useState(false);
  const [data, setData] = useState();

  const fetchData = async () => {
    try {
      setFetching(true);
      const { data } = await axios.get(
        `http://127.0.0.1:${environment.port}/${btoa(getCommand(item))}`,
        { params: { env: environment.selectedState || "default" } }
      );
      setData(JSON.parse(data?.result));
      showNotification({
        message: "Success",
        color: "green",
      });
    } catch (e) {
      showNotification({
        title: "Failed",
        message: e.toString(),
        color: "red",
      });
    } finally {
      setFetching(false);
    }
  };
  return { data, fetchData, fetching, clearData: () => setData(undefined) };
};
