import { DynamicTable } from '../src/DynamicTable.mjs'

const dt = new DynamicTable()
dt.init( { 
    'columnNames': [ 'nr', 'deployments', 'authList', 'accumulatorList' ], 
    'columnLengths': [ 5, 12, 12, 15 ], 
    'columnAlignments': [ 'center', 'right', 'right', 'right' ], 
    'headerAlignment': 'left'
} )
const test = dt.health()

if( test ) {
    console.log( 'Test passed.' )
    process.exit( 0 )
} else {
    console.log( 'Test failed.' )
    process.exit( 1 )
}