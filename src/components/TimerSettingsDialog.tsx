import { HelpOutline } from "@mui/icons-material";
import { Tooltip, Dialog, DialogTitle, DialogContent, Stack, Typography, Select, MenuItem, Slider, IconButton, Switch } from "@mui/material";
import { Languages, lang2TranslateLanguage, languages } from "../types/Languages";
import { UserSettings } from '../datas/UserSettings';
import { useContext, useEffect } from "react";
import { TLLContext } from "../App";
import { CustomWeightEditor } from "./CustomWeightEditor";

export function TimerSettingsDialog(
  props: {
    userSettings: UserSettings,
    setUserSettings: (userSettings: UserSettings) => void,
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
            <Typography >{tll.t("NotifyBySpeechOnStart")}</Typography>
            <Switch checked={userSettings.needSpeechNotifyOnStart} onChange={(e) => {
              setUserSettings({ ...userSettings, needSpeechNotifyOnStart: e.target.checked });
            }
            } />
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography >{tll.t("NotifyBySpeechOnEnd")}</Typography>
            <Switch checked={userSettings.needSpeechNotifyOnEnd} onChange={(e) => {
              setUserSettings({ ...userSettings, needSpeechNotifyOnEnd: e.target.checked });
            }
            } />
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography >{tll.t("Language")}</Typography>
            <Select variant='standard' value={userSettings.language} onChange={(event) => {
              const language = event.target.value as Languages;
              setUserSettings({ ...userSettings, language });
              tll.lang = lang2TranslateLanguage(language);
            }}>
              {languages.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </Select>
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography >{tll.t("Volume")}</Typography>
            <Slider style={{ "width": "50%" }} value={userSettings.notifyVolume} min={0} max={1} step={0.1} onChange={(e, newValue) => {
              setUserSettings({ ...userSettings, notifyVolume: newValue as number });
            }}></Slider>
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography >{tll.t("DiceRollDuration")}</Typography>
            <Slider style={{ "width": "50%" }} value={userSettings.diceRollDuration} min={0} max={3000} step={100} onChange={(e, newValue) => {
              setUserSettings({ ...userSettings, diceRollDuration: newValue as number });
            }} valueLabelDisplay="auto" valueLabelFormat={(value) => `${value / 1000}s`}></Slider>
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography >{tll.t("AutoRoll")}</Typography>
            <Switch checked={userSettings.doAutoTimer} onChange={(e) => {
              setUserSettings({ ...userSettings, doAutoTimer: e.target.checked });
            }
            } />
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography>{tll.t("UseTags")}</Typography>
            <Switch checked={userSettings.doRestrictByTags} onChange={(e) => {
              setUserSettings({ ...userSettings, doRestrictByTags: e.target.checked });
            }
            } />
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography fontSize={16}>{tll.t("EditRunTimeOnTimerPane")}</Typography>
            <Switch checked={userSettings.editRuntimeOnTimerPane} onChange={(e) => {
              setUserSettings({ ...userSettings, editRuntimeOnTimerPane: e.target.checked });
            }
            } />
          </Stack>
          <Stack direction="row" spacing={8}>
            <Typography>{tll.t("EditIntervalOnTimerPane")}</Typography>
            <Switch checked={userSettings.editIntervalOnTimerPane} onChange={(e) => {
              setUserSettings({ ...userSettings, editIntervalOnTimerPane: e.target.checked });
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
              setUserSettings({ ...userSettings, useCustomWeight: e.target.checked });
            }
            } />
          </Stack>
          <CustomWeightEditor
            text={userSettings.customWeightCode}
            onSetButtonClick={(value: string) => {
              setUserSettings({ ...userSettings, customWeightCode: value })
            }}
            onRunButtonClick={
              onCustomWeightEditorButtonClick
            }></CustomWeightEditor>
        </Stack>
      </DialogContent>
    </Dialog>

  )
}