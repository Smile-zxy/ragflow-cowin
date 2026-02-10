import { EmbedContainer } from '@/components/embed-container';
import styles from './index.module.less';
import { useNavigate } from 'react-router';
import { NextMessageInput } from '@/components/message-input/next';
import MessageItem from '@/components/message-item';
import PdfSheet from '@/components/pdf-drawer';
import { useClickDrawer } from '@/components/pdf-drawer/hooks';
import { useSyncThemeFromParams } from '@/components/theme-provider';
import { MessageType, SharedFrom } from '@/constants/chat';
import { useFetchFlowSSE } from '@/hooks/use-agent-request';
import {
  useFetchExternalChatInfo,
  useFetchNextConversationSSE,
} from '@/hooks/use-chat-request';
import i18n from '@/locales/config';
import { buildMessageUuidWithRole } from '@/utils/chat';
import React, { forwardRef, useMemo } from 'react';
import { useSendButtonDisabled } from '../hooks/use-button-disabled';
import {
  useGetSharedChatSearchParams,
  useSendSharedMessage,
} from '../hooks/use-send-shared-message';
import { buildMessageItemReference } from '../utils';




const ChatContainer = () => {
  const navigate = useNavigate();
  const {
    sharedId: conversationId,
    from,
    locale,
    theme,
    visibleAvatar,
  } = useGetSharedChatSearchParams();
  useSyncThemeFromParams(theme);
  const { visible, hideModal, documentId, selectedChunk, clickDocumentButton } =
    useClickDrawer();

  const {
    handlePressEnter,
    handleInputChange,
    value,
    sendLoading,
    derivedMessages,
    hasError,
    stopOutputMessage,
    scrollRef,
    messageContainerRef,
    removeAllMessagesExceptFirst,
  } = useSendSharedMessage();
  const sendDisabled = useSendButtonDisabled(value);
  const { data: chatInfoData } = useFetchExternalChatInfo();

  const useFetchAvatar = useMemo(() => {
    return from === SharedFrom.Agent
      ? useFetchFlowSSE
      : useFetchNextConversationSSE;
  }, [from]);
  React.useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, visibleAvatar]);

  const { data: avatarData } = useFetchAvatar();

  const chatInfo = useMemo(() => {
    return from === SharedFrom.Agent
      ? {
          title: (avatarData as any)?.title,
          avatar: (avatarData as any)?.avatar,
          has_tavily_key: false,
        }
      : chatInfoData;
  }, [from, avatarData, chatInfoData]);

  if (!conversationId) {
    return <div>empty</div>;
  }

  return (
    <>
      <EmbedContainer
        className={styles.shareContainer}
        onBack={() => navigate('/agents')}
        title={chatInfo.title}
        avatar={chatInfo.avatar}
        handleReset={removeAllMessagesExceptFirst}
      >
        <div className="flex flex-1 flex-col p-2.5  h-[90vh] m-3">
          <div
            className={
              'flex flex-1 flex-col overflow-auto scrollbar-auto m-auto w-5/6'
            }
            ref={messageContainerRef}
          >
            <div>
              {derivedMessages?.map((message, i) => {
                return (
                  <MessageItem
                    visibleAvatar={visibleAvatar}
                    key={buildMessageUuidWithRole(message)}
                    avatarDialog={avatarData?.avatar}
                    item={message}
                    nickname="You"
                    reference={buildMessageItemReference(
                      {
                        message: derivedMessages,
                        reference: [],
                      },
                      message,
                    )}
                    loading={
                      message.role === MessageType.Assistant &&
                      sendLoading &&
                      derivedMessages?.length - 1 === i
                    }
                    index={i}
                    clickDocumentButton={clickDocumentButton}
                    showLikeButton={false}
                    showLoudspeaker={false}
                  ></MessageItem>
                );
              })}
            </div>
            <div ref={scrollRef} />
          </div>
          <div className="flex w-full justify-center mb-8">
            <div className="w-5/6">
              <NextMessageInput
                isShared
                value={value}
                disabled={hasError}
                sendDisabled={sendDisabled}
                conversationId={conversationId}
                onInputChange={handleInputChange}
                onPressEnter={handlePressEnter}
                sendLoading={sendLoading}
                uploadMethod="external_upload_and_parse"
                showUploadIcon={false}
                stopOutputMessage={stopOutputMessage}
                showReasoning
                showInternet={chatInfo?.has_tavily_key}
              ></NextMessageInput>
            </div>
          </div>
        </div>
      </EmbedContainer>
      {visible && (
        <PdfSheet
          visible={visible}
          hideModal={hideModal}
          documentId={documentId}
          chunk={selectedChunk}
        ></PdfSheet>
      )}
    </>
  );
};

export default forwardRef(ChatContainer);


