import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState(1);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        Alert.alert(
          'Notificaciones activadas',
          'Ahora recibirás recordatorios de tus próximos pagos.'
        );
      } else {
        Alert.alert(
          'Permisos denegados',
          'Para recibir notificaciones, ve a Configuración y habilita los permisos.'
        );
      }
    } else {
      setNotificationsEnabled(false);
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert(
        'Notificaciones desactivadas',
        'Ya no recibirás recordatorios de pagos.'
      );
    }
  };

  const selectReminderDays = () => {
    Alert.alert(
      'Días de recordatorio',
      'Selecciona cuántos días antes quieres recibir el recordatorio',
      [
        { text: '1 día antes', onPress: () => setReminderDays(1) },
        { text: '3 días antes', onPress: () => setReminderDays(3) },
        { text: '7 días antes', onPress: () => setReminderDays(7) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const testNotification = async () => {
    if (!notificationsEnabled) {
      Alert.alert('Error', 'Las notificaciones están desactivadas');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de pago',
        body: 'Tienes un pago próximo de Netflix por $1,200',
        data: { screen: 'Dashboard' },
      },
      trigger: { seconds: 2 } as any,
    });

    Alert.alert(
      'Notificación de prueba enviada',
      'Deberías recibir una notificación en 2 segundos'
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Eliminar todos los datos',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar lógica para eliminar todos los datos
            Alert.alert(
              'Funcionalidad en desarrollo',
              'Esta función estará disponible próximamente'
            );
          },
        },
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Funcionalidad en desarrollo',
      'La exportación de datos estará disponible próximamente'
    );
  };

  const importData = () => {
    Alert.alert(
      'Funcionalidad en desarrollo',
      'La importación de datos estará disponible próximamente'
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Recordatorios de pago</Text>
            <Text style={styles.settingDescription}>
              Recibe notificaciones antes de tus fechas de pago
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        {notificationsEnabled && (
          <>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={selectReminderDays}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Días de anticipación</Text>
                <Text style={styles.settingDescription}>
                  Recordar {reminderDays} día{reminderDays > 1 ? 's' : ''} antes
                  del pago
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={testNotification}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Probar notificación</Text>
                <Text style={styles.settingDescription}>
                  Enviar una notificación de prueba
                </Text>
              </View>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#007AFF"
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos</Text>

        <TouchableOpacity style={styles.settingRow} onPress={exportData}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Exportar datos</Text>
            <Text style={styles.settingDescription}>
              Crear una copia de seguridad de tus suscripciones
            </Text>
          </View>
          <Ionicons name="download-outline" size={20} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={importData}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Importar datos</Text>
            <Text style={styles.settingDescription}>
              Restaurar desde una copia de seguridad
            </Text>
          </View>
          <Ionicons name="cloud-upload-outline" size={20} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={clearAllData}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, styles.dangerText]}>
              Eliminar todos los datos
            </Text>
            <Text style={styles.settingDescription}>
              Borrar todas las suscripciones permanentemente
            </Text>
          </View>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Versión</Text>
            <Text style={styles.settingDescription}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Desarrollado con</Text>
            <Text style={styles.settingDescription}>React Native + Expo</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Ahorra Ya - Control de Suscripciones
        </Text>
        <Text style={styles.footerSubtext}>
          Mantén el control de tus gastos recurrentes
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  dangerText: {
    color: '#FF3B30',
  },
  footer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
