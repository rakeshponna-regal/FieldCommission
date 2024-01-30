
export const  zeroPad = (number) => {
    return number < 10 ? '0' + number : number;
}

export const dateFormat = () =>{
    const updatedAtDate = new Date();
    const isoDate = updatedAtDate.toISOString();  // 2024-01-12T05:36:15.506Z  
    let formattedDate = isoDate.split('T')[0];
    console.log(formattedDate)
    return formattedDate
}