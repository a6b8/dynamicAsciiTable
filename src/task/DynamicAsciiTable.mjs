import readline from 'readline'
import { printMessages } from '../helpers/mixed.mjs'
import { config } from '../data/config.mjs'


class DynamicAsciiTable {
    #lines
    #config
    #state
    #templates
    #isTableFitting
    #silent


    constructor( silent=false) {
        const [ messages, comments ] = this.#validateConstructor( silent )
        printMessages( { messages, comments, 'silent': false } )

        this.#silent = silent
        this.#config = config

        return true
    }


    init( { columnNames, columnLengths, columnAlignments, headerAlignment } ) {
        const [ messages, comments, addAsDefault ] = this.#validateInit( { columnNames, columnLengths, columnAlignments, headerAlignment } )
        printMessages( { messages, comments, 'silent': this.#silent } )

        this.#lines = new Set
        this.#state = this.#addState( { columnNames, columnLengths, columnAlignments, headerAlignment, addAsDefault } )
        this.#templates = this.#addTemplates()
        this.#isTableFitting = this.#addTableFitting()
        this.#addResizeListener()

        return true
    }


    print() {
        if( this.#isTableFitting['print'] ) {
            this.#state['nonce'] === 0 ? this.#printTableHeader() : ''
            this.#printTableContent()
        } else if( this.#isTableFitting['messageShown'] === false ) {
            console.log( `The terminal width is insufficient for printing the table. Resizing it will disrupt the continuous update.` )
            this.#isTableFitting['messageShown'] = true
            this.#state['nonce'] = 0
        } else {
            return false
        }

        return true
    }


    setValue( { rowIndex, columnName, value, strict=true } ) {
        const [ messages, comments ] = this.#validateSetValue( { rowIndex, columnName, value, strict } )
        strict ? printMessages( { messages, comments, 'silent': this.#silent } ) : ''

        if( !Object.hasOwn( this.#lines, rowIndex ) ) {
            this.#lines[ rowIndex ] = {}
            this.#state['columnNames']
                .forEach( columnName => this.#lines[ rowIndex ][ columnName ] = null )
        }

        if( value !== undefined ) {
            this.#lines[ rowIndex ][ columnName ] = value
        }

        this.#state['latestUpdateChannel'] = `${rowIndex}__${columnName}`

        return true
    }


    getValue( { rowIndex, columnName } ) {
        let value = null
        if( Object.hasOwn( this.#lines, rowIndex ) ) {
            value = this.#lines[ rowIndex ][ columnName ]
        }

        return [ value !== null, value ]
    }


    getConfig() {
        return this.#config
    }


    setConfig( { config } ) {
        const [ messages, comments ] = this.#validateSetConfig( { config } )
        printMessages( { messages, comments, 'silent': false } )

        return true
    }


    health() {
        return true
    }


    #printTableHeader() {
        console.log( this.#templates['firstLine'] ) 
        console.log( this.#templates['header'] )
        console.log( this.#templates['splitterHorizontal'] ) 
        return true
    }


    #printTableContent() {
        Object
            .keys( this.#lines )
            .map( a => parseInt( a ) )
            .sort( ( a, b ) => {
                if( this.#config['view']['sortResults'] === 'ASC' ) {
                    return a - b
                } else if( this.#config['view']['sortResults'] === 'DESC' ) {
                    return b - a
                } else {
                    console.log( `Unknown value for 'view.sortResults': ${this.#config['view']['sortResults']}` )   
                    process.exit( 1 )
                }
            }  )
            .filter( ( a, index, all ) => {
                let from
                if( this.#config['view']['sortResults'] === 'ASC' ) {
                    from = all.length - this.#config['table']['row']['fixedLength']
                    return index >= from ? true : false 
                } else if( this.#config['view']['sortResults'] === 'DESC' ) {
                    from = this.#config['table']['row']['fixedLength']
                    return index < from ? true : false 
                }
            } )
            .reduce( ( acc, rowIndex, index, all ) => {
                const line = this.#getPrintLine( { rowIndex } )
                acc.push( line )

                if( all.length - 1  === index ) {
                    if( this.#state['nonce'] > 0 ) {
                        this.#deleteTabletRows( this.#config['table']['row']['fixedLength'] + 1 )
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


    #addTableFitting() {
        const struct = {
            'messageShown': false,
            'print': null
        }

        if( process.stdout.columns > this.#templates['firstLine'].length ) {
            struct['print'] = true
        } else {
            struct['print'] = false
        }

        return struct
    }


    #addResizeListener() {
        process.stdout.on(
            'resize', 
            () => {
                this.#isTableFitting = this.#addTableFitting()
            } 
        )
        return true
    }


    #deleteTabletRows( n ) {
        readline.moveCursor( process.stdout, 0, -n )
        readline.clearScreenDown( process.stdout )
    }


    #addState( { columnNames, columnLengths, columnAlignments, headerAlignment, addAsDefault } ) {
        const struct = {
            'columnAlignments': [],
            'columnLengths': [],
            'columnNames': [],
            'headerAlignment': null,
            'latestUpdateChannel': null,
            'nonce': 0,
        }

        struct['columnNames'] = columnNames
            .map( columnName => columnName )

        if( addAsDefault.includes( 'columnLengths' ) ) {
            struct['columnLengths'] = new Array( columnNames.length )
                .fill( '' )
                .map( ( a, index ) => this.#config['table']['column']['defaultLength'] )
        } else {
            struct['columnLengths'] = columnLengths
        }

        if( addAsDefault.includes( 'columnAlignments' ) ) {
            struct['columnAlignments'] = new Array( columnNames.length )
                .fill( '' )
                .map( ( a, index ) => this.#config['table']['cell']['defaultAlignment'] )
        } else {
            struct['columnAlignments'] = columnAlignments
        }

        if( addAsDefault.includes( 'headerAlignment' ) ) {
            struct['headerAlignment'] = this.#config['table']['header']['alignment']['use']
        } else {
            struct['headerAlignment'] = headerAlignment
        }

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

        const defaultLines = this.#state['columnLengths']
            .map( length => {
                return new Array( length + paddingTotal )
                    .fill( struct['lineStyle']['horizontal'] )
                    .join( '' )
            } )

        struct['columnNames'] = this.#state['columnNames']
            .map( ( str, columnIndex ) => {
                str = this.#insertPlaceholder( { str, columnIndex } )
                str = this.#insertStr( { str, 'style': this.#config['table']['header']['style']['use'] } )
                str = this.#insertSpacer( { str, columnIndex, 'alignment': this.#state['headerAlignment'] } )
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


    #getPrintLine( { rowIndex } ) {
        const line = this.#state['columnNames']
            .map( ( column, cellIndex ) => {
                let str = this.#getPrintCell( { rowIndex, column, cellIndex } )
                str = this.#insertPlaceholder( { str, columnIndex: cellIndex } )
                str = this.#insertSpacer( { 
                    str, 
                    columnIndex: cellIndex, 
                    'alignment': this.#state['columnAlignments'][ cellIndex ]
                } )
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


    #insertStr( { str, style } ) {
        switch( style ) {
            case 'UpperCase':
                str = str.toUpperCase()
                break
            case 'LowerCase':
                str = str.toLowerCase()
                break
            case 'Capitalize':
                str = str.charAt( 0 ).toUpperCase() + str.slice( 1 )
                break
            case 'None':
                str = str
                break
            default:
                console.log( `Unknown value for 'table.header.style': ${this.#config['table']['header']['style']['use']}` )
                process.exit( 1 )
        }

        return str
    }


    #insertPlaceholder( { str, columnIndex } ) {
        if( str.length > this.#state['columnLengths'][ columnIndex ] ) {
            let l = this.#state['columnLengths'][ columnIndex ] - this.#config['placeholder']['more'].length
            str = str.slice( 0, l ) + this.#config['placeholder']['more']
        }

        return str
    }


    #insertSpacer( { str, columnIndex, alignment } ) {
        const spacerLine = '                                                   '
        let ll = this.#state['columnLengths'][ columnIndex ] - str.length

        if( ll < 0 ) { 
            return str 
        }

        if( str.length < this.#state['columnLengths'][ columnIndex ] ) {
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
                        spacerLine.substring( 0, first ),
                        str,
                        spacerLine.substring( 0, second )
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


    #validateConstructor( silent ) {
        const messages = []
        const comments = []

        if( typeof silent !== 'boolean' ) {
            messages.push( `silent is not type of 'boolean'.` )
        }

        return [ messages, comments ]
    }


    #validateInit( { columnNames, columnLengths, columnAlignments, headerAlignment } ) {
        const messages = []
        const comments = []
        const addAsDefault = []

        if( columnNames === undefined ) {
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

        if( messages.length > 0 ) {
            return [ messages, comments, addAsDefault ]
        }

        if( columnLengths === undefined ) {
            // messages.push( `columnLengths is undefined` )
            comments.push( `columnLengths is undefined. Using default length for all columns '${this.#config['table']['column']['defaultLength']}'.` )
            addAsDefault.push( 'columnLengths' )
        } else if( !Array.isArray( columnLengths ) ) {
            comments.push( `columnLengths is not type of 'array'. Using default length for all columns '${this.#config['table']['column']['defaultLength']}'.` )
            addAsDefault.push( 'columnLengths' )
        } else {
            const test1 = columnLengths
                .map( a => typeof a === 'number' )
                .every( a => a )
            const test2 = columnLengths.length === columnNames.length

            if( !test1 ) {
                messages.push( `columnLengths contains non-number values.` )
            } else if( !test2 ) {
                messages.push( `columnLengths has the wrong length.` )
            }
        }

        if( columnAlignments === undefined ) {
            // messages.push( `columnAlignments is undefined` )
            comments.push( `columnAlignments is undefined. Using default alignment for all columns '${this.#config['table']['column']['defaultAlignment']}'.` )
            addAsDefault.push( 'columnAlignments' )
        } else if( !Array.isArray( columnAlignments ) ) {
            comments.push( `columnAlignments is not type of 'array'. Using default alignment for all columns '${this.#config['table']['column']['defaultAlignment']}'.` )
            addAsDefault.push( 'columnAlignments' )
        } else {
            const test3 = columnAlignments
                .map( a => typeof a === 'string' )
                .every( a => a )
            const test4 = columnAlignments.length === columnNames.length

            if( !test3 ) {
                messages.push( `columnAlignments contains non-string values.` )
            } else if( !test4 ) {
                messages.push( `columnAlignments has the wrong length.` )
            } else {
                const valids = [ 'left', 'right', 'center' ]
                const test5 = columnAlignments
                    .map( a => valids.includes( a ) )
                    .every( a => a )

                if( !test5 ) {
                    messages.push( `columnAlignments contains values that are not 'left', 'right' or 'center'` )
                }
            }
        }

        const validTypes = this.#config['table']['header']['alignment']['types']
        if( headerAlignment === undefined ) {
            // messages.push( `headerAlignment is undefined` )
            addAsDefault.push( 'headerAlignment' )
        } else if( typeof headerAlignment !== 'string' ) {
            messages.push( `headerAlignment is not type of 'string'.` )
        } else if( !validTypes.includes( headerAlignment ) ) {
            messages.push( `headerAlignment has a value that is not 'left', 'right' or 'center'` )
        }

        return [ messages, comments, addAsDefault ]
    }


    #validateSetValue( { rowIndex, columnName, value, strict } ) {
        const messages = []
        const comments = []

        if( rowIndex === undefined ) {
            messages.push( `rowIndex is undefined` )
        } else if( typeof rowIndex !== 'number' ) {
            messages.push( `rowIndex is not type of 'number'.` )
        }

        if( columnName === undefined ) {
            messages.push( `columnName is undefined` )
        }

        if( value === undefined ) {
            messages.push( `value is undefined` )
        }

        if( strict === undefined ) {
            messages.push( `strict is undefined` )
        } else if( typeof strict !== 'boolean' ) {
            messages.push( `strict is not type of 'boolean'.` )
        }

        return [ messages, comments ]
    }


    #validateSetConfig( { config } ) {
        const messages = []
        const comments = []

        if( config === undefined ) {
            messages.push( `Config is undefined.` )
        } else if( typeof config !== 'object' ) {
            messages.push( `Config is not type of 'object'.` )
        } else if( Object.keys( config ).length === 0 ) {
            messages.push( `Config is an empty object.` )
        } else if( Object.keys( config ).length > 0 ) {
            const valids = Object.keys( this.#config )
            const test = Object.keys( config )
                .map( a => valids.includes( a ) )
                .every( a => a )

            if( !test ) {
                messages.push( `Config contains unknown keys: ${Object.keys( this.#config ).join( ', ' ) }.` )
            }
        }

        return [ messages, comments ]
    }
}


export { DynamicAsciiTable }