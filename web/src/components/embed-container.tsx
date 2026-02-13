import { useFetchAppConf } from '@/hooks/logic-hooks';
import { cn } from '@/lib/utils';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { RAGFlowAvatar } from './ragflow-avatar';
import { Button } from './ui/button';

type EmbedContainerProps = {
  title: string;
  avatar?: string;
  handleReset?(): void;
  onBack?: () => void;
  className?: string;
} & PropsWithChildren;

export function EmbedContainer({
  title,
  avatar,
  children,
  handleReset,
  onBack,
  className,
}: EmbedContainerProps) {
  const appConf = useFetchAppConf();
  const { t } = useTranslation();

  return (
    <section className={cn("h-[100vh] flex justify-center items-center", className)}>
      <div className="flex items-start gap-2 absolute left-2 top-5 mt-1">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-2 h-2 text-black mt-1" />
          </Button>
        )}
        <div className="flex flex-col gap-2 items-start ">             
          <img src="/logo.png" alt="" className="h-12 w-25 ml-3 mt-2" />
          {/* <span className="text-2xl font-bold ml-2">{t('flow.clientServiceIntegration')}</span>  */}
        </div>
      </div>
      <div className=" w-[80vw] border rounded-lg">
        <div className="flex justify-between items-center border-b p-3">
          <div className="flex gap-2 items-center">
            <RAGFlowAvatar avatar={avatar} name={title} isPerson />
            <div className="text-xl text-foreground">{title}</div>
          </div>
          <Button
            variant={'secondary'}
            className="text-sm text-foreground cursor-pointer"
            onClick={handleReset}
          >
            <div className="flex gap-1 items-center">
              <RefreshCcw size={14} />
              <span className="text-lg ">Reset</span>
            </div>
          </Button>
        </div>
        {children}
      </div>
    </section>
  );
}
