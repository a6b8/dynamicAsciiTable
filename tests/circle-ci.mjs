import { DynamicAsciiTable, getDemoData } from '../src/index.mjs'

const demoData = getDemoData( 1000, 25 ) 
const dt = new DynamicAsciiTable()
const { columnNames, columnLengths, columnAlignments, headerAlignment} = demoData['init']
dt.init( { columnNames, columnLengths, columnAlignments, headerAlignment } )
const test = dt.health()

if( test ) {
    console.log( 'Test passed.' )
    process.exit( 0 )
} else {
    console.log( 'Test failed.' )
    process.exit( 1 )
}