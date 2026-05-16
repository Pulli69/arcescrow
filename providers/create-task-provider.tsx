'use client'

import React, { createContext, useContext, useState } from 'react'
import { CreateTaskModal } from '@/components/create-task-modal'

interface CreateTaskContextType {
  openModal: () => void
  closeModal: () => void
}

const CreateTaskContext = createContext<CreateTaskContextType | undefined>(undefined)

export function CreateTaskProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <CreateTaskContext.Provider value={{ openModal, closeModal }}>
      {children}
      <CreateTaskModal isOpen={isOpen} onClose={closeModal} />
    </CreateTaskContext.Provider>
  )
}

export function useCreateTaskModal() {
  const context = useContext(CreateTaskContext)
  if (!context) {
    throw new Error('useCreateTaskModal must be used within a CreateTaskProvider')
  }
  return context
}
