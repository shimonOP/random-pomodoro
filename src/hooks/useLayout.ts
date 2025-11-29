import useMediaQuery from "@mui/material/useMediaQuery";


export function useIsMobileLayout() {
  return useMediaQuery(`(max-width:600px)`);
}
export function useIsTabletLayout() {
  return useMediaQuery(`(max-width:900px)`) && useMediaQuery(`(min-width:601px)`);
}
export function useIsPCLayout() {
  return useMediaQuery(`(min-width:901px)`);
}