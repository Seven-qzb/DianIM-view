/**
 * [Modal - ContactProfileCardModal]
 * 移动端/小程序端 个人名片浮层
 * 封装 1:1 还原设计图（image.png）的 ContactProfileCard
 */

import React from 'react';
import { ContactUser } from '../../services/contactService';
import { ContactProfileCard } from '../../components/ContactProfileCard';

export interface ContactProfileCardModalProps {
  contact: ContactUser | null;
  isOpen: boolean;
  fromGroup?: boolean;
  currentGroupName?: string;
  onClose: () => void;
  onSendMessage: (contact: ContactUser) => void;
  onGroupPrivateMessage?: (contact: ContactUser) => void;
  onDeleteFriend?: (contact: ContactUser) => void;
}

export const ContactProfileCardModal: React.FC<ContactProfileCardModalProps> = ({
  contact,
  isOpen,
  fromGroup = false,
  currentGroupName,
  onClose,
  onSendMessage,
  onGroupPrivateMessage,
  onDeleteFriend,
}) => {
  if (!isOpen || !contact) return null;

  return (
    <div
      id="contact-profile-card-modal-backdrop"
      className="fixed inset-0 z-70 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="contact-profile-card-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[320px] flex items-center justify-center animate-in zoom-in-95 duration-150"
      >
        <ContactProfileCard
          contact={contact}
          fromGroup={fromGroup}
          currentGroupName={currentGroupName}
          showCloseButton={true}
          onClose={onClose}
          onStartChat={(c) => {
            onClose();
            onSendMessage(c);
          }}
          onGroupPrivateChat={(c) => {
            onClose();
            if (onGroupPrivateMessage) {
              onGroupPrivateMessage(c);
            } else {
              onSendMessage(c);
            }
          }}
          onDeleted={() => {
            onClose();
            if (onDeleteFriend) onDeleteFriend(contact);
          }}
        />
      </div>
    </div>
  );
};
