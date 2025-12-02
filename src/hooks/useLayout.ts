import useMediaQuery from "@mui/material/useMediaQuery";


export function useIsMobileLayout() {
  return useMediaQuery(`(max-width:900px)`);
}
export function useIsPCLayout() {
  return useMediaQuery(`(min-width:901px)`);
}