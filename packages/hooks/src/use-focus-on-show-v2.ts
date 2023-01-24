import {
  FocusableElement,
  getAllFocusable,
  isRefObject,
} from "@chakra-ui/utils"
import React, { useCallback, useRef } from "react"
import { useEventListener } from "./use-event-listener-v2"
import { useUpdateEffect } from "./use-update-effect"
import { useSafeLayoutEffect } from "./use-safe-layout-effect"

export interface UseFocusOnShowV2Options {
  visible?: boolean
  shouldFocus?: boolean
  preventScroll?: boolean
  focusRef?: React.RefObject<FocusableElement>
}

const defaultOptions: UseFocusOnShowV2Options = {
  preventScroll: true,
  shouldFocus: false,
}

export function useFocusOnShowV2<T extends HTMLElement>(
  target: React.RefObject<T> | T,
  options = defaultOptions,
) {
  const { focusRef, preventScroll, shouldFocus, visible } = options
  const element = isRefObject(target) ? target.current : target

  const autoFocusValue = shouldFocus && visible
  const autoFocusRef = useRef(autoFocusValue)
  const lastVisibleRef = useRef(visible)

  useSafeLayoutEffect(() => {
    if (!lastVisibleRef.current && visible) {
      autoFocusRef.current = autoFocusValue
    }
    lastVisibleRef.current = visible
  }, [visible, autoFocusValue])

  const onFocus = useCallback(() => {
    if (!visible || !element || !autoFocusRef.current) return
    autoFocusRef.current = false

    if (element.contains(document.activeElement as HTMLElement)) return

    if (focusRef?.current) {
      requestAnimationFrame(() => {
        focusRef.current?.focus({ preventScroll })
      })
    } else {
      const tabbableEls = getAllFocusable(element)
      if (tabbableEls.length > 0) {
        requestAnimationFrame(() => {
          tabbableEls[0].focus({ preventScroll })
        })
      }
    }
  }, [visible, preventScroll, element, focusRef])

  useUpdateEffect(() => {
    onFocus()
  }, [onFocus])

  useEventListener(element, "transitionend", onFocus)
}
