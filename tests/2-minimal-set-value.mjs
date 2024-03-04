import { DynamicAsciiTable } from '../src/index.mjs'

const dt = new DynamicAsciiTable()
dt.init( { 'columnNames': [ 'a', 'b', 'c' ] } )
dt.setValue( { rowIndex: 0, columnName: 'a', value: 1 } )
dt.print()