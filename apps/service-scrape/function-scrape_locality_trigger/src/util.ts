export const chunkArray = <T>(array: T[], chunkSize: number) => {
    const newArray: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize)
        newArray.push(chunk)
    }
    return newArray
}
