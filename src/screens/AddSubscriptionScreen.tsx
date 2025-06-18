import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useSubscriptionStore } from '../store/subscriptionStore';

const CATEGORIES = [
  'Entretenimiento',
  'Música',
  'Video',
  'Software',
  'Noticias',
  'Fitness',
  'Productividad',
  'Educación',
  'Otros',
];

const PAYMENT_METHODS = [
  'Tarjeta de crédito',
  'Tarjeta de débito',
  'PayPal',
  'Transferencia bancaria',
  'Mercado Pago',
  'Otro',
];

export default function AddSubscriptionScreen() {
  const navigation = useNavigation();
  const { addSubscription, isLoading } = useSubscriptionStore();

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'ARS',
    frequency: 'monthly' as 'monthly' | 'annual',
    next_payment_date: new Date(),
    payment_method: '',
    category: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const showCurrencyPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'ARS', 'USD', 'EUR'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            const currencies = ['ARS', 'USD', 'EUR'];
            setFormData((prev) => ({
              ...prev,
              currency: currencies[buttonIndex - 1],
            }));
          }
        }
      );
    }
  };

  const showFrequencyPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Mensual', 'Anual'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            const frequencies: ('monthly' | 'annual')[] = ['monthly', 'annual'];
            setFormData((prev) => ({
              ...prev,
              frequency: frequencies[buttonIndex - 1],
            }));
          }
        }
      );
    }
  };

  const showPaymentMethodPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', ...PAYMENT_METHODS],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setFormData((prev) => ({
              ...prev,
              payment_method: PAYMENT_METHODS[buttonIndex - 1],
            }));
          }
        }
      );
    }
  };

  const showCategoryPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', ...CATEGORIES],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setFormData((prev) => ({
              ...prev,
              category: CATEGORIES[buttonIndex - 1],
            }));
          }
        }
      );
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre de la suscripción es obligatorio');
      return;
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      Alert.alert('Error', 'El monto debe ser un número válido');
      return;
    }

    try {
      await addSubscription({
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        frequency: formData.frequency,
        next_payment_date: formData.next_payment_date
          .toISOString()
          .split('T')[0],
        payment_method: formData.payment_method || undefined,
        category: formData.category || undefined,
      });

      Alert.alert('Éxito', 'Suscripción agregada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo agregar la suscripción');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, next_payment_date: selectedDate }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholder="Ej: Netflix, Spotify, etc."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Monto *</Text>
              <TextInput
                style={styles.input}
                value={formData.amount}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, amount: text }))
                }
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>Moneda</Text>
              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  style={styles.iosPickerButton}
                  onPress={showCurrencyPicker}
                >
                  <Text style={styles.iosPickerText}>{formData.currency}</Text>
                  <Text style={styles.iosPickerArrow}>▼</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.currency}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, currency: value }))
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="ARS" value="ARS" />
                    <Picker.Item label="USD" value="USD" />
                    <Picker.Item label="EUR" value="EUR" />
                  </Picker>
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frecuencia</Text>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={showFrequencyPicker}
              >
                <Text style={styles.iosPickerText}>
                  {formData.frequency === 'monthly' ? 'Mensual' : 'Anual'}
                </Text>
                <Text style={styles.iosPickerArrow}>▼</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.frequency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, frequency: value }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Mensual" value="monthly" />
                  <Picker.Item label="Anual" value="annual" />
                </Picker>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Próximo pago</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.next_payment_date.toLocaleDateString('es-AR')}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.next_payment_date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Método de pago</Text>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={showPaymentMethodPicker}
              >
                <Text style={styles.iosPickerText}>
                  {formData.payment_method || 'Seleccionar...'}
                </Text>
                <Text style={styles.iosPickerArrow}>▼</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.payment_method}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, payment_method: value }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccionar..." value="" />
                  {PAYMENT_METHODS.map((method) => (
                    <Picker.Item key={method} label={method} value={method} />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría</Text>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={showCategoryPicker}
              >
                <Text style={styles.iosPickerText}>
                  {formData.category || 'Seleccionar...'}
                </Text>
                <Text style={styles.iosPickerArrow}>▼</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccionar..." value="" />
                  {CATEGORIES.map((category) => (
                    <Picker.Item
                      key={category}
                      label={category}
                      value={category}
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  iosPickerButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  iosPickerText: {
    fontSize: 16,
    color: '#333',
  },
  iosPickerArrow: {
    fontSize: 12,
    color: '#666',
  },
});
