## Explorer

Up in the top right of the application is an explorer button.

![explorer](/explorer.png)

Press it to open the explorer modal, the explorer allows you to explore the DCS Script Environment.

It represents variables you can access.

> `_G` represents the global scope or root.

## Usage

Navigate to an item of interest as in the below we can see the available Airbase categories.

![example](/explorer-2.png)

To use what we see above, simply write a script as below and reference it.

```lua
return Airbase.Category
```

And get the following response

```lua
{
  "AIRDROME": 0,
  "HELIPAD": 1,
  "SHIP": 2
}
```