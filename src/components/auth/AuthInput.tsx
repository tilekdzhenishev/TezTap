import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { theme } from '../../utils/theme';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  passwordRules?: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
  numberOfLines?: number;
  returnKeyType?: 'done' | 'next' | 'go' | 'send' | 'search';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput>;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  passwordRules,
  error,
  hint,
  multiline = false,
  numberOfLines,
  returnKeyType,
  onSubmitEditing,
  inputRef,
}) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const borderColor = error ? theme.colors.danger : focused ? theme.colors.primary : '#2A2A2A';

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, focused && styles.labelFocused, !!error && styles.labelError]}>
        {label}
      </Text>
      <View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            secureTextEntry && styles.inputWithAccessory,
            multiline && styles.inputMultiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#444444"
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          passwordRules={passwordRules}
          autoCorrect={false}
          spellCheck={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          importantForAutofill={autoComplete === 'off' ? 'no' : 'auto'}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} style={styles.eyeButton}>
            {hidden ? (
              <Eye size={18} color={theme.colors.textSecondary} />
            ) : (
              <EyeOff size={18} color={theme.colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  labelFocused: {
    color: theme.colors.primary,
  },
  labelError: {
    color: theme.colors.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 14,
  },
  inputWithAccessory: {
    paddingRight: 10,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  eyeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: 6,
  },
  hintText: {
    fontSize: 12,
    color: '#555555',
    marginTop: 6,
  },
});
