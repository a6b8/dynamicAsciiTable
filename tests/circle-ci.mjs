import { DynamicTable } from '../src/DynamicTable.mjs'

const columnNames = [ 'nr', 'deployments', 'authList', 'accumulatorList' ]
const columnLengths = [ 5, 12, 12, 15 ]
const columnAlignments = [ 'center', 'right', 'right', 'right' ]
const headerAlignment = 'left'

const dt = new DynamicTable()
dt.init( { columnNames, columnLengths, columnAlignments, headerAlignment } )
const test = dt.health()

if( test ) {
    console.log( 'Test passed.' )
    process.exit( 0 )
} else {
    console.log( 'Test failed.' )
    process.exit( 1 )
}