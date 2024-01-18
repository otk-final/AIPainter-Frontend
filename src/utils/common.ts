
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

/**
 * !!!会判断是否有小数，有则显示没有显示整数
 * 根据以分为单位的价格取整、小数，单位元
 * e.g. 1000 => 10   1010 => 10.10
 * @param price 价格
 */
 export function getPriceInt(price?: number) {
  if (!price || isNaN(price)) return "0";
  const priceArr = (price / 100).toFixed(2).split(".");
  if (priceArr.length === 2) {
    return priceArr[1] === "00" ? priceArr[0] : priceArr.join(".");
  }
  return priceArr[0];
}
