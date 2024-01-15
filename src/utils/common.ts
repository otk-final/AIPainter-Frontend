
/**
 * 
 * @param t 毫秒数
 * @returns "00:00"
 */
export const getTime = (t: number): string=>{
    let time = Math.floor(t / 600); 
    let time_result;
    if(time > 60) {
        let time_m = Math.floor(time / 60);
        let time_s = Math.floor(time%60);
        let m = time_m > 9 ? time_m : `0${time_m}`;
       return time_result = `${m}:${time_s > 9 ? time_s : '0'+time_s}`
    }else {
      return  time_result = `00:${time > 9 ? time : '0'+time}`;
    }
}