const logic = {}


logic.eucDistance = ( v1, v2 ) => {
    if ( !v1 || !v2 ) { throw new Error("eucDistance, missing args" ) }
    if ( !v1.x && v1.x != 0 || !v1.y && v1.y != 0 ) { throw new Error(`eucDistance bad args : ${v1, v2}`)}
    return Math.sqrt( Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) )
}



export { logic as default }