import { DynamicAsciiTable, getDemoData } from '../src/index.mjs'

const demoData = getDemoData( 1000, 100 ) 
const delay = ( ms ) => new Promise( resolve => setTimeout( resolve, ms ) )
 
const dt = new DynamicAsciiTable()
const { columnNames, columnLengths, columnAlignments, headerAlignment} = demoData['init']
dt.init( { columnNames, columnLengths, columnAlignments, headerAlignment } )

for( const row of demoData['rows'] ) {
    const { rowIndex, columnName, value } = row
    dt.setValue( { rowIndex, columnName, value } )
    dt.print()
    await delay( 10 )
}

/*
    const [ isNotNull, value ] = dt.getValue( {
        rowIndex,
        columnName
    } )
*/