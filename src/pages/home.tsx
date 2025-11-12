import { useNavigate, useSearch } from "@tanstack/react-router";
import { useAtom, useSetAtom } from "jotai";
import { homeChatInputValueAtom } from "../atoms/chatAtoms";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { IpcClient } from "@/ipc/ipc_client";
import { generateCuteAppName } from "@/lib/utils";
import { useLoadApps } from "@/hooks/useLoadApps";
import { useSettings } from "@/hooks/useSettings";
import { SetupBanner } from "@/components/SetupBanner";
import { isPreviewOpenAtom } from "@/atoms/viewAtoms";
import { useState, useEffect, useCallback } from "react";
import { useStreamChat } from "@/hooks/useStreamChat";
import { HomeChatInput } from "@/components/chat/HomeChatInput";
import { usePostHog } from "posthog-js/react";
import { PrivacyBanner } from "@/components/TelemetryBanner";
import { INSPIRATION_PROMPTS } from "@/prompts/inspiration_prompts";
import { useAppVersion } from "@/hooks/useAppVersion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ImportAppButton } from "@/components/ImportAppButton";
import { showError } from "@/lib/toast";
import { invalidateAppQuery } from "@/hooks/useLoadApp";
import { useQueryClient } from "@tanstack/react-query";

import type { FileAttachment } from "@/ipc/ipc_types";
import { NEON_TEMPLATE_IDS } from "@/shared/templates";
import { neonTemplateHook } from "@/client_logic/template_hook";
import { ProBanner } from "@/components/ProBanner";
import { AppCreationWizard } from "@/components/onboarding/AppCreationWizard";
import { wizardStateAtom } from "@/atoms/wizardAtoms";
import { Sparkles } from "lucide-react";

// Adding an export for attachments
export interface HomeSubmitOptions {
  attachments?: FileAttachment[];
}

export default function HomePage() {
  const [inputValue, setInputValue] = useAtom(homeChatInputValueAtom);
  const [wizardState, setWizardState] = useAtom(wizardStateAtom);
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });
  const setSelectedAppId = useSetAtom(selectedAppIdAtom);
  const { refreshApps } = useLoadApps();
  const { settings, updateSettings } = useSettings();
  const setIsPreviewOpen = useSetAtom(isPreviewOpenAtom);
  const [isLoading, setIsLoading] = useState(false);
  const { streamMessage } = useStreamChat({ hasChatId: false });
  const posthog = usePostHog();
  const appVersion = useAppVersion();
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const [releaseUrl, setReleaseUrl] = useState("");
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  useEffect(() => {
    const updateLastVersionLaunched = async () => {
      if (
        appVersion &&
        settings &&
        settings.lastShownReleaseNotesVersion !== appVersion
      ) {
        const shouldShowReleaseNotes = !!settings.lastShownReleaseNotesVersion;
        await updateSettings({
          lastShownReleaseNotesVersion: appVersion,
        });
        // It feels spammy to show release notes if it's
        // the users very first time.
        if (!shouldShowReleaseNotes) {
          return;
        }

        try {
          const result = await IpcClient.getInstance().doesReleaseNoteExist({
            version: appVersion,
          });

          if (result.exists && result.url) {
            setReleaseUrl(result.url + "?hideHeader=true&theme=" + theme);
            setReleaseNotesOpen(true);
          }
        } catch (err) {
          console.warn(
            "Unable to check if release note exists for: " + appVersion,
            err,
          );
        }
      }
    };
    updateLastVersionLaunched();
  }, [appVersion, settings, updateSettings, theme]);

  // Get the appId from search params
  const appId = search.appId ? Number(search.appId) : null;

  // State for random prompts
  const [randomPrompts, setRandomPrompts] = useState<
    typeof INSPIRATION_PROMPTS
  >([]);

  // Function to get random prompts
  const getRandomPrompts = useCallback(() => {
    const shuffled = [...INSPIRATION_PROMPTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  // Initialize random prompts
  useEffect(() => {
    setRandomPrompts(getRandomPrompts());
  }, [getRandomPrompts]);

  // Redirect to app details page if appId is present
  useEffect(() => {
    if (appId) {
      navigate({ to: "/app-details", search: { appId } });
    }
  }, [appId, navigate]);

  const handleSubmit = async (options?: HomeSubmitOptions) => {
    const attachments = options?.attachments || [];

    if (!inputValue.trim() && attachments.length === 0) return;

    try {
      setIsLoading(true);
      // Create the chat and navigate
      const result = await IpcClient.getInstance().createApp({
        name: generateCuteAppName(),
      });
      if (
        settings?.selectedTemplateId &&
        NEON_TEMPLATE_IDS.has(settings.selectedTemplateId)
      ) {
        await neonTemplateHook({
          appId: result.app.id,
          appName: result.app.name,
        });
      }

      // Stream the message with attachments
      streamMessage({
        prompt: inputValue,
        chatId: result.chatId,
        attachments,
      });
      await new Promise((resolve) =>
        setTimeout(resolve, settings?.isTestMode ? 0 : 2000),
      );

      setInputValue("");
      setSelectedAppId(result.app.id);
      setIsPreviewOpen(false);
      await refreshApps(); // Ensure refreshApps is awaited if it's async
      await invalidateAppQuery(queryClient, { appId: result.app.id });
      posthog.capture("home:chat-submit");
      navigate({ to: "/chat", search: { id: result.chatId } });
    } catch (error) {
      console.error("Failed to create chat:", error);
      showError("Failed to create app. " + (error as any).toString());
      setIsLoading(false); // Ensure loading state is reset on error
    }
    // No finally block needed for setIsLoading(false) here if navigation happens on success
  };

  // Función para completar el wizard
  const handleWizardComplete = (generatedPrompt: string) => {
    setInputValue(generatedPrompt);
    setWizardState((prev) => ({
      ...prev,
      isActive: false,
    }));
    // Enviar automáticamente
    setTimeout(() => {
      handleSubmit();
    }, 100);
  };

  // Función para cancelar el wizard
  const handleWizardCancel = () => {
    setWizardState((prev) => ({
      ...prev,
      isActive: false,
      currentStepIndex: 0,
      selections: [],
      history: [],
    }));
  };

  // Función para activar el wizard con un flujo específico
  const handleStartWizard = (flowId: string) => {
    setWizardState({
      isActive: true,
      currentStepIndex: 0,
      flowId,
      selections: [],
      history: [],
    });
    posthog.capture("home:wizard-started", { flowId });
  };

  // Loading overlay for app creation
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center max-w-3xl m-auto p-8">
        <div className="w-full flex flex-col items-center">
          {/* Loading Spinner */}
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute top-0 left-0 w-full h-full border-8 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-8 border-t-primary rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            Construyendo tu aplicación
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
            Estamos preparando tu aplicación con magia de IA. <br />
            Esto puede tomar un momento...
          </p>
        </div>
      </div>
    );
  }

  // Main Home Page Content
  return (
    <div className="flex flex-col items-center justify-center max-w-3xl w-full m-auto p-8">
      <SetupBanner />

      {wizardState.isActive ? (
        // Mostrar el wizard cuando está activo
        <AppCreationWizard
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      ) : (
        // Mostrar la interfaz normal
        <div className="w-full">
          <ImportAppButton />
          <HomeChatInput onSubmit={handleSubmit} />

          <div className="flex flex-col gap-4 mt-2">
            {/* Selector de categoría para el wizard */}
            <div className="text-center mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                ¿Qué tipo de aplicación quieres crear?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleStartWizard("juegos-desafios")}
                  className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 border-blue-500
                             bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20
                             transition-all duration-200
                             hover:shadow-lg hover:scale-[1.02]
                             active:scale-[0.98]"
                >
                  <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Juegos y desafíos
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartWizard("aprendizaje-conocimiento")}
                  className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 border-purple-500
                             bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20
                             transition-all duration-200
                             hover:shadow-lg hover:scale-[1.02]
                             active:scale-[0.98]"
                >
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Aprendizaje
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartWizard("ayudar-comunidad")}
                  className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 border-green-500
                             bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20
                             transition-all duration-200
                             hover:shadow-lg hover:scale-[1.02]
                             active:scale-[0.98]"
                >
                  <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Ayudar comunidad
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                o elige una idea rápida
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {randomPrompts.map((item, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setInputValue(`Créame ${item.label}`)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-200
                           bg-white/50 backdrop-blur-sm
                           transition-all duration-200
                           hover:bg-white hover:shadow-md hover:border-gray-300
                           active:scale-[0.98]
                           dark:bg-gray-800/50 dark:border-gray-700
                           dark:hover:bg-gray-800 dark:hover:border-gray-600"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setRandomPrompts(getRandomPrompts())}
              className="self-center flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200
                       bg-white/50 backdrop-blur-sm
                       transition-all duration-200
                       hover:bg-white hover:shadow-md hover:border-gray-300
                       active:scale-[0.98]
                       dark:bg-gray-800/50 dark:border-gray-700
                       dark:hover:bg-gray-800 dark:hover:border-gray-600"
            >
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Más ideas
              </span>
            </button>
          </div>
          {settings?.showProBanner && <ProBanner />}
        </div>
      )}
      <PrivacyBanner />

      {/* Release Notes Dialog */}
      <Dialog open={releaseNotesOpen} onOpenChange={setReleaseNotesOpen}>
        <DialogContent className="max-w-4xl bg-(--docs-bg) pr-0 pt-4 pl-4 gap-1">
          <DialogHeader>
            <DialogTitle>¿Qué hay de nuevo en v{appVersion}?</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-10 top-2 focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={() =>
                window.open(
                  releaseUrl.replace("?hideHeader=true&theme=" + theme, ""),
                  "_blank",
                )
              }
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </DialogHeader>
          <div className="overflow-auto h-[70vh] flex flex-col ">
            {releaseUrl && (
              <div className="flex-1">
                <iframe
                  src={releaseUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title={`Release notes for v${appVersion}`}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
