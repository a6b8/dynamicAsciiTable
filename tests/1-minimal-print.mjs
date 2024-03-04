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
    await delay( 50 )
}