import { HelpOutline, VolumeUp, Timer, Language, Notifications, Casino, Label, Edit, Functions, Close, DeleteForever, PhoneIphone } from "@mui/icons-material";
import { Tooltip, Dialog, DialogTitle, DialogContent, Stack, Typography, Select, MenuItem, Slider, IconButton, Switch, useMediaQuery, Paper, Divider, Box, Button, TextField } from "@mui/material";
import { clearAllData } from "../db";
import { Languages, lang2TranslateLanguage, languages } from "../types/Languages";
import { UserSettings } from '../datas/UserSettings';
import { useContext, useEffect } from "react";
import { TLLContext } from "../App";
import { CustomWeightEditor } from "./CustomWeightEditor";
import { useDiceTodoStates } from "../contexts/DiceTodoContext";
import { useIsMobileLayout } from "../hooks/useLayout";
import { WebPushSettings } from "./WebPushSettings";

export function TimerSettingsDialog(
  props: {
    timerSettingsDialogOpen: boolean,
    handleTimerSettingsDialogClose: () => void
    onCustomWeightEditorButtonClick: (value: string) => void
  }
) {
  const { timerSettingsDialogOpen, handleTimerSettingsDialogClose, onCustomWeightEditorButtonClick } = props;
  const { userSettings, setUserSettings } = useDiceTodoStates();
  const isMobileLayout = useIsMobileLayout();
  if (!userSettings) return <></>;
  const tll = useContext(TLLContext);

  const SettingItem = ({ icon, label, control, tooltip }: {
    icon: React.ReactNode,
    label: string,
    control: React.ReactNode,
    tooltip?: string
  }) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
        <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip}>
            <IconButton size="small" sx={{ p: 0.5 }}>
              <HelpOutline fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Box>{control}</Box>
    </Stack>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mt: 2, mb: 1 }}>
      {children}
    </Typography>
  );

  return (
    <Dialog
      onClose={handleTimerSettingsDialogClose}
      open={timerSettingsDialogOpen}
      maxWidth="md"
      fullWidth
      fullScreen={isMobileLayout}
      PaperProps={{
        sx: {
          borderRadius: isMobileLayout ? 0 : 2,
          maxHeight: isMobileLayout ? '100vh' : '90vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Timer color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {tll.t("TimerSettings")}
            </Typography>
          </Stack>
          {isMobileLayout && (
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleTimerSettingsDialogClose}
              aria-label="close"
            >
              <Close />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: isMobileLayout ? 2 : 3, overflow: 'auto' }}>
        <Stack direction="column" spacing={3}>

          {/* 通知設定セクション */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <SectionTitle>{"Notifications"}</SectionTitle>

            <SettingItem
              icon={<Notifications />}
              label={tll.t("NotifyBySpeechOnStart")}
              control={
                <Switch
                  checked={userSettings.needSpeechNotifyOnStart}
                  onChange={(e) => setUserSettings({ ...userSettings, needSpeechNotifyOnStart: e.target.checked })}
                />
              }
            />

            <SettingItem
              icon={<Notifications />}
              label={tll.t("NotifyBySpeechOnEnd")}
              control={
                <Switch
                  checked={userSettings.needSpeechNotifyOnEnd}
                  onChange={(e) => setUserSettings({ ...userSettings, needSpeechNotifyOnEnd: e.target.checked })}
                />
              }
            />

            <SettingItem
              icon={<VolumeUp />}
              label={tll.t("Volume")}
              control={
                <Slider
                  sx={{ width: 150, ml: 2 }}
                  value={userSettings.notifyVolume}
                  min={0}
                  max={1}
                  step={0.1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                  onChange={(e, newValue) => setUserSettings({ ...userSettings, notifyVolume: newValue as number })}
                />
              }
            />

            <Divider sx={{ my: 2 }} />

            <SectionTitle>{"WebPush通知"}</SectionTitle>

            <WebPushSettings />
          </Paper>

          {/* 一般設定セクション */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <SectionTitle>{"General"}</SectionTitle>

            <SettingItem
              icon={<Language />}
              label={tll.t("Language")}
              control={
                <Select
                  variant="outlined"
                  size="small"
                  value={userSettings.language}
                  onChange={(event) => {
                    const language = event.target.value as Languages;
                    setUserSettings({ ...userSettings, language });
                    tll.lang = lang2TranslateLanguage(language);
                  }}
                  sx={{ minWidth: 120 }}
                >
                  {languages.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              }
            />

            <SettingItem
              icon={<Casino />}
              label={tll.t("DiceRollDuration")}
              control={
                <Slider
                  sx={{ width: 150, ml: 2 }}
                  value={userSettings.diceRollDuration}
                  min={0}
                  max={3000}
                  step={100}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value / 1000}s`}
                  onChange={(e, newValue) => setUserSettings({ ...userSettings, diceRollDuration: newValue as number })}
                />
              }
            />

          </Paper>

          {/* タイマー設定セクション */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <SectionTitle>{tll.t("TimerSettings")}</SectionTitle>

            <SettingItem
              icon={<Label />}
              label={tll.t("UseTags")}
              control={
                <Switch
                  checked={userSettings.doRestrictByTags}
                  onChange={(e) => setUserSettings({ ...userSettings, doRestrictByTags: e.target.checked })}
                />
              }
            />

            <SettingItem
              icon={<Edit />}
              label={tll.t("EditRunTimeOnTimerPane")}
              control={
                <Switch
                  checked={userSettings.editRuntimeOnTimerPane}
                  onChange={(e) => setUserSettings({ ...userSettings, editRuntimeOnTimerPane: e.target.checked })}
                />
              }
            />

            <SettingItem
              icon={<Edit />}
              label={tll.t("EditIntervalOnTimerPane")}
              control={
                <Switch
                  checked={userSettings.editIntervalOnTimerPane}
                  onChange={(e) => setUserSettings({ ...userSettings, editIntervalOnTimerPane: e.target.checked })}
                />
              }
            />
          </Paper>

          {/* カスタム重み設定セクション */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <SectionTitle>{"Advanced"}</SectionTitle>

            <SettingItem
              icon={<Functions />}
              label={tll.t("UseCustomWeight")}
              control={
                <Switch
                  checked={userSettings.useCustomWeight}
                  onChange={(e) => setUserSettings({ ...userSettings, useCustomWeight: e.target.checked })}
                />
              }
              tooltip={`${tll.t("CustomWeightTips1")}\n${tll.t("CustomWeightTips2")}\n${tll.t("CustomWeightTips3")}\n${tll.t("CustomWeightTips4")}\n${tll.t("CustomWeightTips5")}\n${tll.t("CustomWeightTips6")}\n${tll.t("CustomWeightTips7")}`}
            />

            {userSettings.useCustomWeight && (
              <Box sx={{ mt: 2 }}>
                <CustomWeightEditor
                  text={userSettings.customWeightCode}
                  onSetButtonClick={(value: string) => setUserSettings({ ...userSettings, customWeightCode: value })}
                  onRunButtonClick={onCustomWeightEditorButtonClick}
                />
              </Box>
            )}
          </Paper>

          {/* データ管理セクション */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <SectionTitle>{tll.t("Others")}</SectionTitle>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteForever />}
              onClick={async () => {
                if (window.confirm(tll.t("AreYouSureToResetAllData"))) {
                  await clearAllData();
                  window.location.reload();
                }
              }}
            >
              {tll.t("ResetAllData")}
            </Button>
          </Paper>
        </Stack>
      </DialogContent>
    </Dialog>

  )
}