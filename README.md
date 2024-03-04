[![CircleCI](https://img.shields.io/circleci/build/github/a6b8/dynamicAsciiTable/main)]() ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

# DynamicAsciiTable
This module helps to display a dynamic table in the terminal. The module was developed for applications that need to monitor a large number of different tasks using multithreading and asynchronous queries.

## Features:
- Efficient resource usage.
- Formatting and alignment of the header and content areas.
- Separation of data input and data display.
- Auto-detection of terminal width.
- Autoscrolling and sorting functionality to keep the latest rows in view.

## Quickstart
To authentically represent the usage, you can import a sample dataset with `getDemoData`, which then synchronously inserts the data and updates the table.

**Terminal**
```bash
npm i dynamicAsciiTable
```

**Code**
```js
import { DynamicAsciiTable, getDemoData } from 'dynamicAsciiTable'

const demoData = getDemoData(1000, 100)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const dt = new DynamicAsciiTable()
const { columnNames, columnLengths, columnAlignments, headerAlignment } = demoData['init']
dt.init({ columnNames, columnLengths, columnAlignments, headerAlignment })

for (const row of demoData['rows']) {
    const { rowIndex, columnName, value } = row
    dt.setValue({ rowIndex, columnName, value })
    dt.print()
    await delay(10)
}
```

### Code

This example shows how to query public Nodes with Node.js.

## Table of Contents
- [DynamicAsciiTable](#dynamicasciitable)
  - [Features:](#features)
  - [Quickstart](#quickstart)
    - [Code](#code)
  - [Table of Contents](#table-of-contents)
  - [Methods](#methods)
    - [constructor()](#constructor)
    - [init()](#init)
    - [print()](#print)
    - [setValue()](#setvalue)
    - [getValue()](#getvalue)
    - [getConfig()](#getconfig)
    - [setConfig()](#setconfig)
    - [health()](#health)
  - [License](#license)


## Methods
Among the public methods, the most important ones are:

- `.init()`: Initializes the internal data and can be updated with another `.init()`.
- `.setValue()`: This is where the data is played in.
- `.print()`: This is how the data is displayed as a table, and from the second retrieval on, it is overwritten. Unless a `.init()` resets the table and data. Then a new table is written.

### constructor()


**Method**
```js
constructor( silent )
```

| Key          | Type     | Default | Description                                        | Required |
|--------------|----------|---------|----------------------------------------------------|----------|
| silent       | boolean  | `false` | Whether to disable comments (true for yes, false for no).| Yes      |




**Example**
```js
import { DynamicAsciiTable } from 'dynamicAsciiTable'
const dt = new DynamicAsciiTable() 
```

**Returns**
```js
true
```

### init()

With this method, all variables needed internally are initialized. Also, templates are created so that the `print` method can run as efficiently as possible.

**Method**
```js
.init( { columnNames, columnLengths, columnAlignments, headerAlignment } )
```

| Key                | Type     | Description                                       | Required |
|--------------------|----------|---------------------------------------------------|----------|
| columnNames        | array of strings    | Array of column names. Example `[ 'nr', 'test' ]` | Yes      |
| columnLengths      | array of numbers   | Array of column lengths. `[ 10, 10 ]` | No      |
| columnAlignments   | array of strings   | Array of column alignments `['left', 'right', 'center']`. | No      |
| headerAlignment    | string   | Alignment of the header `left`, `right`, `center`.   | No       |


**Example**
```js
true
```

**Returns**
```js
import { DynamicAsciiTable, getDemoData } from '../src/index.mjs'

const demoData = getDemoData( 1000, 100 ) 
const dt = new DynamicAsciiTable()
const { columnNames, columnLengths, columnAlignments, headerAlignment} = demoData['init']
dt.init( { columnNames, columnLengths, columnAlignments, headerAlignment } )
```

### print()

This method outputs the actual table. The header is written at the first call after the .init() method. From the second call on, the body is deleted in order to be overwritten with the new information.



**Method**
```js
.print()
```

| Key          | Type   | Description                          | Required |
|--------------|--------|--------------------------------------|----------|
| None         |        | No parameters required.              |          |


This table describes the usage of the `.print()` method.

**Example**
```js
import { DynamicAsciiTable } from '../src/index.mjs'

const delay = ( ms ) => new Promise( resolve => setTimeout( resolve, ms ) )
 
const dt = new DynamicAsciiTable()
dt.init( { 'columnNames': [ 'a', 'b', 'c' ] } )

const rows = [
    { rowIndex: 0, columnName: 'a', value: 1 },
    { rowIndex: 1, columnName: 'b', value: 2 },
    { rowIndex: 0, columnName: 'b', value: 3 },
    { rowIndex: 1, columnName: 'c', value: 4 }
]

for( const row of rows ) {
    dt.setValue( row )
    dt.print()
}
```

**Returns**
```js
true
```

### setValue()

With this method, the table can be filled with content.

**Method**
```js
.setValue( { rowIndex, columnName, value, strict=true } )
```

| Key           | Type     | Description                                                   | Required |
|---------------|----------|---------------------------------------------------------------|----------|
| rowIndex      | number   | Index of the row where the value will be set.                 | Yes      |
| columnName    | string   | Name of the column where the value will be set.               | Yes      |
| value         | any      | The value to be set in the specified cell.                    | Yes      |
| strict        | boolean  | Determines if strict mode is enabled (default is true).       | No       |


**Example**
```js
import { DynamicAsciiTable } from '../src/index.mjs'

const dt = new DynamicAsciiTable()
dt.init( { 'columnNames': [ 'a' ] } )
dt.setValue( { rowIndex: 0, columnName: 'a', value: 1 } )
dt.print()
```

**Returns**
```js
true
```

### getValue()

With this method, a value can be output from the internal memory.

**Method**
```js
.getValue( { rowIndex, columnName } ) 
```

| Key           | Type     | Description                                   | Required |
|---------------|----------|-----------------------------------------------|----------|
| rowIndex      | number   | Index of the row from which to retrieve the value.  | Yes      |
| columnName    | string   | Name of the column from which to retrieve the value.| Yes      |


**Example**
```js
import { DynamicAsciiTable } from '../src/index.mjs'

const dt = new DynamicAsciiTable()
dt.init( { 'columnNames': [ 'a', 'b', 'c' ] } )

dt.setValue( { rowIndex: 0, columnName: 'a', value: 1 } )
const value = dt.getValue( { rowIndex: 0, columnName: 'a' } )
console.log( '>', value )
```

**Returns**
```js
[ value !== null, value ]
```

### getConfig()

With this method, the current configuration can be output. The default configuration is located under `./src/data/config.mjs` for inspection. Changing it is done with `.setConfig()`.

**Method**
```js
.getConfig() 
```

| Key           | Type   | Description                           | Required |
|---------------|--------|---------------------------------------|----------|
| None          |        | No parameters required.               |          |


This table describes the usage of the `getConfig` method.

**Example**
```js
import { DynamicAsciiTable } from '../src/index.mjs'

const dt = new DynamicAsciiTable()
dt.init( { 'columnNames': [ 'a', 'b', 'c' ] } )
const config = dt.getConfig()
```

**Returns**
```js
key/value Object
```

### setConfig()

With this method, the configuration can be changed. It is recommended to first load the default setting and then adjust it according to your own preferences.

**Method**
```js
.setConfig( { config } )
```

| Key           | Type   | Description                                   | Required |
|---------------|--------|-----------------------------------------------|----------|
| config        | object | An object containing the configuration settings to be set. | Yes      |


**Example**
```js
import { DynamicAsciiTable } from '../src/index.mjs'

const dt = new DynamicAsciiTable()
dt.init( { 'columnNames': [ 'a', 'b', 'c' ] } )
const config = dt.getConfig()
config['symbols']['use'] = 'double'
dt.setConfig( { config } )
```

**Returns**
```js
true
```

### health()

This method is an internal function to check if the class is loading properly.

**Method**
```js
.health()
```

| Key           | Type   | Description                           | Required |
|---------------|--------|---------------------------------------|----------|
| None          |        | No parameters required.               |          |


**Example**
```js
import { DynamicAsciiTable } from '../src/index.mjs'

const dt = new DynamicAsciiTable()
dt.init( { 'columnNames': [ 'a', 'b', 'c' ] } )
dt.setValue( { rowIndex: 0, columnName: 'a', value: 1 } )
dt.health()
```

**Returns**
```js
boolean
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.