/**
 * Motion primitives per spec: 150–250 ms, ease-out, used for month
 * switching, date selection and screen transitions. Respects the
 * system Reduce Motion setting.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then(
      (v) => mounted && setReduce(Boolean(v)),
      () => {},
    );
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduce);
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);
  return reduce;
}

/**
 * Fades and slides its children in whenever `trigger` changes
 * (200 ms, ease-out). Renders statically under Reduce Motion.
 */
export function FadeIn({
  trigger,
  style,
  children,
}: {
  trigger: string | number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const reduce = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  const translate = useRef(new Animated.Value(0)).current;
  const first = useRef(true);

  useEffect(() => {
    if (reduce) {
      opacity.setValue(1);
      translate.setValue(0);
      return;
    }
    if (first.current) {
      first.current = false;
      return;
    }
    opacity.setValue(0);
    translate.setValue(8);
    const useNativeDriver = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
    ]).start();
  }, [trigger, reduce, opacity, translate]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY: translate }] }]}>
      {children}
    </Animated.View>
  );
}
