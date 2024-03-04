import { DynamicTable } from '../src/DynamicTable.mjs'

process.stdout.on('resize', () => {
    console.log('screen size has changed!');
    console.log(`${process.stdout.columns}x${process.stdout.rows}`);
} )


const columnNames = [ 'nr', 'deployments', 'authList', 'accumulatorList' ]
const columnLengths = [ 5, 12, 12, 15 ]
const columnAlignments = [ 'right', 'left', 'left', 'left' ]



const dt = new DynamicTable()
dt.init( { columnNames, columnLengths, columnAlignments:'' } )

const delay = ( ms ) => new Promise( resolve => setTimeout( resolve, ms ) )
dt.printTableHeader()
for( let i = 0; i < 10000; i++ ) {
    const index = i % 10
    const randomIndex = Math.floor(Math.random() * columns.length)

    const [ isNotNull, value ] = dt.getValue( {
        'rowIndex': index,
        'key': columns[ randomIndex ]['key']
    } )

    dt.setValue( {
        'rowIndex': index,
        'key': columns[ randomIndex ]['key'],
        'value': isNotNull ? value + i : i
    } )

    await delay( 20 )
    // dt.printTableContent2()
    terminal.printTableContent()
}


// console.log( terminal.getValue() )