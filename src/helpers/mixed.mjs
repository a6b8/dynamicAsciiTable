function printMessages( { messages=[], comments=[], silent } ) {
    const n = [
        [ comments, 'Comment', false ],
        [ messages, 'Message', true ]
    ]
        .forEach( ( a, index ) => {
            const [ msgs, headline, stop ] = a

            if( silent === true && headline === 'Comment') {
                return true
            }

            msgs
                .forEach( ( msg, rindex, all ) => {
                    rindex === 0 ? console.log( `\n${headline}${all.length > 1 ? 's' : ''}:` ) : ''
                    console.log( `  - ${msg}` )
                    if( ( all.length - 1 ) === rindex ) {
                        if( stop === true ) {
                            throw new Error("")
                        }
                    }
                } )
        
            if( headline === 'Comment' && msgs.length !== 0 ) {
                console.log( "Disable comments by setting the first constructor variable 'silent' to 'true'." )
            }
        } )

    return true
}


export { printMessages }