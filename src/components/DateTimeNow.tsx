import { useEffect, useState } from "react";
const DateTimeNow = () => {
    const [dateTimeNow, setDateTimeNow] = useState(new Date())
    const [tick, setTick] = useState(false)
    useEffect(() => {
        setTimeout(() => {
            setDateTimeNow(new Date())
            setTick(!tick)
        }, 30 * 1000);
    }, [tick])
    return (
        <>
            {dateTimeNow.toLocaleDateString() + " " + dateTimeNow.toLocaleString(undefined, { timeStyle: "short" })}
        </>
    );
}
export default DateTimeNow;