import { HelpOutline } from "@mui/icons-material";
import { Tooltip, Dialog, DialogTitle, DialogContent, Stack, Typography, Select, MenuItem, Slider, IconButton, Switch } from "@mui/material";
import { Languages, languages } from "../types/Languages";
import { UserSettings } from "../datas/UserSettings";
import { useContext } from "react";
import { TLLContext } from "../App";
import { CustomWeightEditor } from "./CustomWeightEditor";

export function TimerSettingsDialog(
  props: {
    userSettings: UserSettings,
    setUserSettings: () => void,
    timerSettingsDialogOpen: boolean,
    handleTimerSettingsDialogClose: () => void
    onCustomWeightEditorButtonClick: (value: string) => void
  }
) {
  const { userSettings, setUserSettings, timerSettingsDialogOpen, handleTimerSettingsDialogClose, onCustomWeightEditorButtonClick } = props;
  const tll = useContext(TLLContext);
  return (
    <Dialog onClose={handleTimerSettingsDialogClose} open={timerSettingsDialogOpen} >
      <DialogTitle >{tll.t("TimerSettings")}</DialogTitle>
      <DialogContent dividers>
        <Stack direction="column" spacing={2} sx={{ width: 500, height: 700 }}>
          <Stack direction="row" spacing={8}>
            <Typography >{tll.t("NotifyBySpeech")}</Typography>
            <Switch checked={userSettings.needSpeechNotify} onChange={(e) => {
              userSettings.needSpeechNotify = e.target.checked;
              setUserSettings();
            }
            } />
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography >{tll.t("Language")}</Typography>
            <Select variant='standard' value={userSettings.language} onChange={(event) => {
              userSettings.language = event.target.value as Languages;
              setUserSettings();
            }}>
              {languages.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </Select>
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography >{tll.t("Volume")}</Typography>
            <Slider style={{ "width": "50%" }} value={userSettings.notifyVolume} min={0} max={1} step={0.1} onChange={(e, newValue) => {
              userSettings.notifyVolume = newValue as number;
              setUserSettings();
            }}></Slider>
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography >{tll.t("AutoRoll")}</Typography>
            <Switch checked={userSettings.doAutoTimer} onChange={(e) => {
              userSettings.doAutoTimer = e.target.checked;
              setUserSettings();
            }
            } />
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography>{tll.t("UseTags")}</Typography>
            <Switch checked={userSettings.doRestrictByTags} onChange={(e) => {
              userSettings.doRestrictByTags = e.target.checked;
              setUserSettings();
            }
            } />
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography fontSize={16}>{tll.t("EditRunTimeOnTimerPane")}</Typography>
            <Switch checked={userSettings.editRuntimeOnTimerPane} onChange={(e) => {
              userSettings.editRuntimeOnTimerPane = e.target.checked;
              setUserSettings();
            }
            } />
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography>{tll.t("EditIntervalOnTimerPane")}</Typography>
            <Switch checked={userSettings.editIntervalOnTimerPane} onChange={(e) => {
              userSettings.editIntervalOnTimerPane = e.target.checked;
              setUserSettings();
            }
            } />
          </Stack>
          <Stack direction="row" spacing={8}>
            <Stack direction="row">
              <Typography sx={{ m: "auto 0" }}>{tll.t("UseCustomWeight")}</Typography>
              <Tooltip title={
                <Stack>
                  <Typography variant='caption'>
                    {tll.t("CustomWeightTips1")}
                  </Typography>
                  <Typography variant='caption'>
                    {tll.t("CustomWeightTips2")}
                  </Typography>
                  <Typography variant='caption'>
                    {tll.t("CustomWeightTips3")}
                  </Typography>
                  <Typography variant='caption'>
                    {tll.t("CustomWeightTips4")}
                  </Typography>
                  <Typography variant='caption'>
                    {tll.t("CustomWeightTips5")}
                  </Typography>
                  <Typography variant='caption'>
                    {tll.t("CustomWeightTips6")}
                  </Typography>
                  <Typography variant='caption'>
                    {tll.t("CustomWeightTips7")}
                  </Typography>
                </Stack>}>
                <IconButton disableRipple disableTouchRipple disableFocusRipple>
                  <HelpOutline></HelpOutline>
                </IconButton>
              </Tooltip>
            </Stack>
            <Switch checked={userSettings.useCustomWeight} onChange={(e) => {
              userSettings.useCustomWeight = e.target.checked;
              setUserSettings()
            }
            } />
          </Stack>
          <CustomWeightEditor
            text={userSettings.customWeightCode}
            onSetButtonClick={(value: string) => {
              userSettings.customWeightCode = value
              setUserSettings()
            }}
            onRunButtonClick={
              onCustomWeightEditorButtonClick
            }></CustomWeightEditor>
        </Stack>
      </DialogContent>
    </Dialog>

  )
}