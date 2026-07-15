import React from 'react';
import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  CSSProperties,
  ReactNode,
} from 'react';

import { Button } from '@actual-app/components/button';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { Toggle } from '@actual-app/components/toggle';
import { View } from '@actual-app/components/view';
import { css, cx } from '@emotion/css';

type FieldLabelProps = {
  title: string;
  flush?: boolean;
  style?: CSSProperties;
};

export function FieldLabel({ title, flush, style }: FieldLabelProps) {
  return (
    <Text
      style={{
        marginBottom: 5,
        marginTop: flush ? 0 : 25,
        fontSize: 14,
        color: theme.tableRowHeaderText,
        padding: `0 ${styles.mobileEditingPadding}px`,
        userSelect: 'none',
        ...style,
      }}
    >
      {title}
    </Text>
  );
}

const valueStyle = {
  borderWidth: 1,
  borderColor: theme.formInputBorder,
  borderRadius: 14,
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
  marginLeft: 10,
  marginRight: 10,
  height: styles.mobileMinHeight,
};

export const hideNativeDateIconClassName = css({
  '&::-webkit-calendar-picker-indicator': {
    display: 'none',
  },
  '&::-webkit-date-and-time-value': {
    textAlign: 'left',
  },
});

const iconFieldWrapperClassName = css({
  ...valueStyle,
  flexDirection: 'row',
  alignItems: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  gap: 8,
  '&:focus-within': {
    borderColor: theme.formInputBorderSelected,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.formInputBorderSelected} 18%, transparent), 0 12px 24px rgba(0, 0, 0, 0.12)`,
  },
});

type InputFieldProps = ComponentPropsWithRef<typeof Input> & {
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
};

const iconStyle: CSSProperties = {
  color: theme.pageTextSubdued,
  flexShrink: 0,
  alignSelf: 'stretch',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
};

export function InputField({
  disabled,
  style,
  onUpdate,
  iconStart,
  iconEnd,
  className,
  ref,
  ...props
}: InputFieldProps) {
  if (iconStart || iconEnd) {
    return (
      <View
        className={iconFieldWrapperClassName}
        nativeStyle={{
            backgroundColor: disabled
              ? theme.formInputTextReadOnlySelection
              : theme.cardBackground,
        }}
      >
        {iconStart && <View style={iconStyle}>{iconStart}</View>}
        <Input
          ref={ref}
          autoCorrect="false"
          autoCapitalize="none"
          disabled={disabled}
          onUpdate={onUpdate}
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            height: '100%',
            padding: 0,
            textAlign: 'left',
            color: disabled ? theme.tableTextInactive : theme.tableText,
            ...style,
            borderRadius: 0,
            boxShadow: 'none',
          }}
          {...props}
          className={renderProps =>
            cx(
              hideNativeDateIconClassName,
              typeof className === 'function'
                ? className(renderProps)
                : className,
            )
          }
        />
        {iconEnd && <View style={iconStyle}>{iconEnd}</View>}
      </View>
    );
  }

  return (
    <Input
      ref={ref}
      autoCorrect="false"
      autoCapitalize="none"
      disabled={disabled}
      onUpdate={onUpdate}
      className={className}
      style={{
        ...valueStyle,
        ...style,
        color: disabled ? theme.tableTextInactive : theme.tableText,
        backgroundColor: disabled
          ? theme.formInputTextReadOnlySelection
          : theme.cardBackground,
        transition:
          'border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
      }}
      {...props}
    />
  );
}

InputField.displayName = 'InputField';

type TapFieldProps = ComponentPropsWithRef<typeof Button> & {
  icon?: ReactNode;
  placeholder?: string;
  rightContent?: ReactNode;
  alwaysShowRightContent?: boolean;
  textStyle?: CSSProperties;
};

const defaultTapFieldClassName = () =>
  css({
    ...valueStyle,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.tableBackground,
    backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${theme.tableBackground} 92%, ${theme.mobileNavItemSelected}), ${theme.tableBackground})`,
    transition:
      'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
    '&[data-disabled]': {
      backgroundColor: theme.formInputTextReadOnlySelection,
    },
    '&[data-pressed]': {
      opacity: 0.82,
      transform: 'translateY(1px)',
      boxShadow: 'none',
    },
    '&[data-hovered]': {
      borderColor: theme.formInputBorderSelected,
      boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.formInputBorderSelected} 14%, transparent), 0 12px 24px rgba(0, 0, 0, 0.12)`,
    },
  });

export function TapField({
  value,
  children,
  className,
  icon,
  placeholder,
  rightContent,
  alwaysShowRightContent,
  textStyle,
  ref,
  ...props
}: TapFieldProps) {
  const showPlaceholder = !value && !!placeholder;
  return (
    <Button
      ref={ref}
      bounce={false}
      className={renderProps =>
        cx(
          defaultTapFieldClassName(),
          typeof className === 'function' ? className(renderProps) : className,
        )
      }
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          {icon && (
            <View
              style={{
                color: theme.pageTextSubdued,
                marginRight: 8,
                flexShrink: 0,
              }}
            >
              {icon}
            </View>
          )}
          <Text
            style={{
              flex: 1,
              userSelect: 'none',
              textAlign: 'left',
              color: showPlaceholder
                ? theme.formInputTextPlaceholder
                : undefined,
              ...textStyle,
            }}
          >
            {showPlaceholder ? placeholder : value}
          </Text>
        </>
      )}
      {(!props.isDisabled || alwaysShowRightContent) && rightContent}
    </Button>
  );
}

TapField.displayName = 'TapField';

type ToggleFieldProps = ComponentPropsWithoutRef<typeof Toggle>;

export function ToggleField({
  id,
  isOn,
  onToggle,
  style,
  className,
  isDisabled = false,
}: ToggleFieldProps) {
  return (
    <Toggle
      id={id}
      isOn={isOn}
      isDisabled={isDisabled}
      onToggle={onToggle}
      style={style}
      className={String(
        css([
          {
            '& [data-toggle-container]': {
              width: 50,
              height: 24,
            },
            '& [data-toggle]': {
              width: 20,
              height: 20,
            },
          },
          className,
        ]),
      )}
    />
  );
}
