import useMediaQuery from "@mui/material/useMediaQuery";


export function useIsMobile() {
  return useMediaQuery(`(max-width:600px)`);
}
export function useIsTablet() {
  return useMediaQuery(`(max-width:900px)`) && useMediaQuery(`(min-width:601px)`);
}
export function useIsPC() {
  return useMediaQuery(`(min-width:901px)`);
}