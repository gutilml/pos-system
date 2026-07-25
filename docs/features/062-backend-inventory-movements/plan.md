# Implementation Plan - Backend Inventory Movements

## Architecture

* `com.pos.inventory` — controller, movement service, `StockMovement` entity
* Extend `InventoryServiceImpl` for negative sales + SALE movements
* `Product.wholesaleMargin` + ProductService maintenance
* Schema + migration SQL

## Tests

Service/controller coverage for receive blend, adjust, child→parent, sale negative, low-stock list.
