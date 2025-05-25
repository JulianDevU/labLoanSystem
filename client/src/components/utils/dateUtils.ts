export const convertLocalToUTC = (localDateString: string) => {
  
    const date = new Date(localDateString);
  
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
  
    const utcDate = new Date(Date.UTC(year, month, day, hours, minutes));
  
    return utcDate.toISOString();
  };
  
  export const getMinDateTime = (marginMinutes: number = 5): string => {
    const now = new Date();
    const minDate = new Date(now.getTime() + marginMinutes * 60 * 1000);
  
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');
    const hours = String(minDate.getHours()).padStart(2, '0');
    const minutes = String(minDate.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  