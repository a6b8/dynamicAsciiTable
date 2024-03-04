import readline from 'readline'


class DynamicTable {
    #lines
    #config
    #state
    #templates


    constructor() {
        this.#config = {
            'placeholder': {
                'more': '...',
                'null': 'n/a'
            },
            'symbols': {
                'use': 'single',
                'single': {
                    'vertical': '│',
                    'horizontal': '─',
                    'top_left': '┌',
                    'top_center': '┬',
                    'top_right': '┐',
                    'center_left': '├',
                    'center_center': '┼',
                    'center_right': '┤',
                    'bottom_left': '└',
                    'bottom_center': '┴',
                    'bottom_right': '┘'
                },
                'double': {
                    'vertical': '║',
                    'horizontal': '═',
                    'top_left': '╔',
                    'top_center': '╦',
                    'top_right': '╗',
                    'center_left': '╠',
                    'center_center': '╬',
                    'center_right': '╣',
                    'bottom_left': '╚',
                    'bottom_center': '╩',
                    'bottom_right': '╝'
                }
            },
            'view': {
                'sortResults': 'ASC'
            },
            'table': {
                'alignment': {
                    'number': 'right',
                    'string': 'left',
                    'float': 'right',
                    'default': 'left'
                },
                'cell': {
                    'padding': 2,
                    'defaultAlignment': 'left'
                },
                'column': {
                    'indexName': 'nr',
                    'defaultLength': 15
                },
                'row': {
                    'fixedLength': 4
                }
            }
        }

        return true
    }


    init( { columnNames, columnLengths, columnAlignments } ) {
        const [ messages, comments ] = this.#validateInit( { columnNames, columnLengths, columnAlignments } )
        messages.forEach( ( msg, index, all ) => {
            console.log( msg )
            if( all.length -1 === index ) { throw new Error() }
        } )

        this.#lines = {}
        this.#state = this.#addState( { columns } )
        this.#templates = this.#addTemplates()

        return true
    }


    #addState( { columns } ) {
        const struct = {
            'nonce': 0,
            'columns': null,
            'length': null,
            'latestUpdateChannel': null
        }

        struct['columns'] = [ 
            this.#config['table']['column']['indexName'], 
            ...columns.map( column => column['key'] )
        ]

        struct['length'] = struct['columns']
            .map( column => {
                const index = columns.findIndex( a => a['key'] === column )
                if( index !== -1 ) {
                    return columns[ index ]['length']
                } else {
                    return this.#config['table']['column']['defaultLength']
                }
            } ) 

        return struct
    }


    #addTemplates() {
        const struct = {
            'columnNames': [],
            'contentTemplate': '',
            'emptyContent': [],
            'firstLine': '',
            'footerLine': '',
            'header': '',
            'lineStyle': {},
            'spacerLine': '',
            'splitterHorizontal': '',
            'splitterVertical': '',
            'splitterStart': '',
            'splitterEnd': '',
        }

        const use = this.#config['symbols']['use']
        struct['lineStyle'] = this.#config['symbols'][ use ]
        const paddingTotal = this.#config['table']['cell']['padding'] * 2

        const spacerLine = '                                                   '
        struct['spacerLine'] = spacerLine

        struct['splitterVertical'] = [
            spacerLine.substring( 0, this.#config['table']['cell']['padding'] ),
            struct['lineStyle']['vertical'],
            spacerLine.substring( 0, this.#config['table']['cell']['padding'] )
        ]
            .join( '' )

        struct['splitterStart'] = [
            struct['lineStyle']['vertical'],
            spacerLine.substring( 0, this.#config['table']['cell']['padding'] )
        ]
            .join( '' )

        struct['splitterEnd'] = [
            spacerLine.substring( 0, this.#config['table']['cell']['padding'] ),
            struct['lineStyle']['vertical']
        ]
            .join( '' )

        const defaultLine = new Array( this.#config['table']['column']['defaultLength'] + paddingTotal )
            .fill( struct['lineStyle']['horizontal'] )
            .join( '' )

        const defaultLines = this.#state['length']
            .map( length => {
                return new Array( length + paddingTotal )
                    .fill( struct['lineStyle']['horizontal'] )
                    .join( '' )
            } )

        struct['columnNames'] = this.#state['columns']
            .map( ( str, columnIndex ) => {
                str = this.#insertPlaceholder( { str, columnIndex } )
                str = this.#insertSpacer( { str, columnIndex } )
/*
                if( column.length > this.#state['length'][ index ] ) {
                    const l = this.#config['placeholder']['more'].length
                    column = column.slice( 0, this.#state['length'][ index ] - l ) + this.#config['placeholder']['more']
                } else if( column.length < this.#state['length'][ index ] ) {
                    column = column + spacerLine.substring( 0, this.#state['length'][ index ] - column.length )
                }
*/
                return str
            } )

        const firstLine = struct['columnNames']
            .map( ( a, index ) => defaultLines[ index ] )
            .join( struct['lineStyle']['top_center'] )
        struct['firstLine'] = `${struct['lineStyle']['top_left'] }${firstLine}${struct['lineStyle']['top_right']}`

        struct['header'] = [
            struct['splitterStart'],
            struct['columnNames'].join( struct['splitterVertical'] ),
            struct['splitterEnd']
        ]
            .join( '' )
        
        const splitter = struct['columnNames']
            .map( ( a, index ) => defaultLines[ index ] ) 
            .join( struct['lineStyle']['center_center']  )
        struct['splitterHorizontal'] = `${struct['lineStyle']['center_left'] }${splitter}${struct['lineStyle']['center_right']}`


        const footerLine = struct['columnNames']
            .map( ( a, index ) => defaultLines[ index ] )
            .join( struct['lineStyle']['bottom_center'] )
        struct['footerLine'] = `${struct['lineStyle']['bottom_left'] }${footerLine}${struct['lineStyle']['bottom_right']}`

        struct['emptyContent'].push( struct['footerLine'] )

        struct['contentTemplate'] = [ struct['splitterStart'], '{{content}}', struct['splitterEnd'] ]
            .join( '' )

        const emptyLine = struct['columnNames']
            .map( column => column.replace( /./g, ' ' ) )
            .join( `${struct['splitterVertical']}` )
        struct['emptyLine'] = struct['contentTemplate'].replace( '{{content}}', emptyLine )

        struct['emptyContent'] = new Array( this.#config['table']['row']['fixedLength'] )
            .fill()
            .reduce( ( acc, a, index, all ) => {
                acc.push( struct['emptyLine'] )
                if( all.length - 1 === index ) {
                    acc.push( struct['footerLine'] )
                }
                return acc
            }, [] )

        return struct
    }
 

    setValue( { rowIndex, key, value } ) {
        if( !Object.hasOwn( this.#lines, rowIndex ) ) {
            this.#lines[ rowIndex ] = {}
            this.#state['columns']
                .forEach( key => this.#lines[ rowIndex ][ key ] = null )
        }

        if( value !== undefined ) {
            this.#lines[ rowIndex ][ key ] = value
        }

        this.#state['latestUpdateChannel'] = `${rowIndex}__${key}`

        return true
    }


    getValue( { rowIndex, key } ) {
        let value = null
        if( Object.hasOwn( this.#lines, rowIndex ) ) {
            value = this.#lines[ rowIndex ][ key ]
        }

        return [ value !== null, value ]
    }


    printTableHeader() {
        console.log( this.#templates['firstLine'] ) 
        console.log( this.#templates['header'] )
        console.log( this.#templates['splitterHorizontal'] ) 
        return true
    }


    deleteTabletRows( n ) {
        readline.moveCursor( process.stdout, 0, -n )
        readline.clearScreenDown( process.stdout )
    }


    printTableContent() {
        Object
            .keys( this.#lines )
            .map( a => parseInt( a ) )
            .sort( ( a, b ) => a - b )
            .filter( ( a, index, all ) => {
                const from = all.length - this.#config['table']['row']['fixedLength']
                return index >= from ? true : false 
            } )
            .reduce( ( acc, rowIndex, index, all ) => {
                const line = this.#getPrintLine( { rowIndex } )
                acc.push( line )

                if( all.length - 1  === index ) {
                    if( this.#state['nonce'] > 0 ) {
                        this.deleteTabletRows( this.#config['table']['row']['fixedLength'] + 1 )
                    }

                    const l = ( this.#config['table']['row']['fixedLength'] - acc.length + 1 ) * -1
                    const render = [
                        ...acc,
                        ...this.#templates['emptyContent'].slice( l )
                    ]
                        .forEach( line => console.log( line ) )
                }

                return acc
            }, [] )

        this.#state['nonce'] += 1
        return true
    }


    #getPrintLine( { rowIndex } ) {
        const line = this.#state['columns']
            .map( ( column, cellIndex ) => {
                let str = this.#getPrintCell( { rowIndex, column, cellIndex } )
                str = this.#insertPlaceholder( { str, columnIndex: cellIndex } )
                str = this.#insertSpacer( { str, columnIndex: cellIndex, alignment: 'center' } )
                return str
            } )
            .join( `${this.#templates['splitterVertical']}` )

        return this.#templates['contentTemplate'].replace( '{{content}}', line )
    }


    #getPrintCell( { rowIndex, column, cellIndex } ) {
        let str = ''
        if( cellIndex === 0 ) {
            str = `${rowIndex}`
        } else {
            str = `${this.#lines[ rowIndex ][ column ]}`

            const latestUpdate = `${rowIndex}__${column}`
            if( str === 'null' ) {
                str = this.#config['placeholder']['null']
            } else if( latestUpdate === this.#state['latestUpdateChannel'] ) {
                str = `${str}`
            }
        }

        return str
    }


    #insertPlaceholder( { str, columnIndex } ) {
        if( str.length > this.#state['length'][ columnIndex ] ) {
            let l = this.#state['length'][ columnIndex ] - this.#config['placeholder']['more'].length
            str = str.slice( 0, l ) + this.#config['placeholder']['more']
        }

/*
        if( column.length > this.#state['length'][ index ] ) {
            const l = this.#config['placeholder']['more'].length
            column = column.slice( 0, this.#state['length'][ index ] - l ) + this.#config['placeholder']['more']
        } else if( column.length < this.#state['length'][ index ] ) {
            column = column + spacerLine.substring( 0, this.#state['length'][ index ] - column.length )
        }
*/
        return str
    }


    #insertSpacer( { str, columnIndex, alignment='left' } ) {
        const spacerLine = '                                                   '
        let ll = this.#state['length'][ columnIndex ] - str.length

        if( ll < 0 ) { 
            return str 
        }

        if( str.length < this.#state['length'][ columnIndex ] ) {
            switch( alignment ) {
                case 'left':
                    str = `${str}${spacerLine.substring( 0, ll )}`
                    break
                case 'right':
                    str = `${spacerLine.substring( 0, ll )}${str}`
                    break
                case 'center':
                    const first = Math.floor( ll / 2 )
                    const second = ll - first
                    str = [
                        spacerLine.substring( 0, second ),
                        str,
                        spacerLine.substring( 0, first )
                    ]
                        .join( '' )
                    break
                default:
                    console.log( `Alignment with the value: ${alignment} is unknown.` )
                    break
            }
        }

        return str
    }


    #validateInit( { columnNames, columnLengths, columnAlignments } ) {
        const messages = []
        const comments = []

        if( columnNames !== undefined ) {
            messages.push( `columnNames is undefined` )
        } else if( !Array.isArray( columnNames ) ) {
            messages.push( `columnNames is not type of 'array'.` )
        } else {
            const test = columnNames
                .map( a => typeof a === 'string' )
                .every( a => a )

            if( !test ) {
                messages.push( `columnNames contains non-string values.` )
            }
        }

        if( columnLengths !== undefined ) {
            // messages.push( `columnLengths is undefined` )
            comments.push( `columnLengths is undefined. Using default length for all columns ${this.#config['table']['column']['defaultLength']}.` )
        } else if( !Array.isArray( columnLengths ) ) {
            messages.push( `columnLengths is not type of 'array'.` )
        } else {
            const test = columnLengths
                .map( a => typeof a === 'number' )
                .every( a => a )

            if( !test ) {
                messages.push( `columnLengths contains non-number values.` )
            }
        }

        if( columnAlignments !== undefined ) {
            // messages.push( `columnAlignments is undefined` )
        } else if( !Array.isArray( columnAlignments ) ) {
            messages.push( `columnAlignments is not type of 'array'.` )
        } else {
            const test = columnAlignments
                .map( a => typeof a === 'string' )
                .every( a => a )

            if( !test ) {
                messages.push( `columnAlignments contains non-string values.` )
            } else {
                const valids = [ 'left', 'right', 'center' ]
                const test2 = columnAlignments
                    .map( a => valids.includes( a ) )
                    .every( a => a )

                if( !test2 ) {
                    messages.push( `columnAlignments contains values that are not 'left', 'right' or 'center'` )
                }
            }
        }


        return [ messages, comments ]
    }
}


export { DynamicTable }