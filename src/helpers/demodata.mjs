function getDemoData( times, friction ) {
    const result = {
        'init': {
            'columnNames': [ 'nr', 'deployments', 'authList', 'accumulatorList' ], 
            'columnLengths': [ 5, 12, 12, 15 ], 
            'columnAlignments': [ 'left', 'right', 'right', 'right' ], 
            'headerAlignment': 'left'
        },
        'rows': []
    }
    
    const columnNames = result['init']['columnNames']
    let count = 1
    result['rows'] = new Array( times )
        .fill( '' )
        .reduce( ( acc, a, index, all ) => {
            const columnName = columnNames[ Math.floor( Math.random() * columnNames.length ) ]
            const  struct = {
                'rowIndex': ( index ) % ( 1 + count ),
                'columnName': columnName,
                'value': null
            }
    
            if( index % friction === 0 ) {
                count++
            }
    
            struct['value'] = acc
                .filter( ( a, index ) => a['columnName'] === struct['columnName'] )
                .filter( ( a, index ) => typeof a['value'] === 'number' )
                .reduce( ( abb, a, index, all ) => {
                    if( a['value'] > abb ) { return a['value'] }
                    return abb
                }, 0 ) + 1 * 2
    
            acc.push( struct )
    
            return acc 
        }, [] )

    return result
} 

export { getDemoData }