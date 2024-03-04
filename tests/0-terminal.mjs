import { DynamicTable } from '../src/DynamicTable.mjs'

process.stdout.on('resize', () => {
    console.log('screen size has changed!');
    console.log(`${process.stdout.columns}x${process.stdout.rows}`);
} )


const columnNames = [ 'nr', 'deployments', 'authList', 'accumulatorList' ]
const columnLengths = [ 5, 12, 12, 15 ]
const columnAlignments = [ 'center', 'right', 'right', 'right' ]
const headerAlignment = 'left'
 

const dt = new DynamicTable()
dt.init( { columnNames, columnLengths, columnAlignments, headerAlignment } )

const delay = ( ms ) => new Promise( resolve => setTimeout( resolve, ms ) )
for( let i = 0; i < 10000; i++ ) {
    const rowIndex = i % 10
    const randomIndex = Math.floor(Math.random() * columnNames.length)

    const columnName = columnNames[ randomIndex ]
    const [ isNotNull, value ] = dt.getValue( {
        rowIndex,
        columnName
    } )

    dt.setValue( {
        rowIndex,
        columnName, 
        'value': isNotNull ? value + i : i
    } )

    await delay( 20 )
    // dt.printTableContent2()
    dt.print()
}


// console.log( dt.getValue() )