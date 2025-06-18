import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useSubscriptionStore } from '../store/subscriptionStore';
import { Subscription } from '../database/database';
import { RootStackParamList } from '../navigation/AppNavigator';

type DashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const {
    subscriptions,
    isLoading,
    error,
    loadSubscriptions,
    deleteSubscription,
    getMonthlyTotal,
  } = useSubscriptionStore();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const monthlyTotal = getMonthlyTotal();

  const handleDeleteSubscription = (id: number, name: string) => {
    Alert.alert(
      'Eliminar suscripción',
      `¿Estás seguro que deseas eliminar "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteSubscription(id),
        },
      ]
    );
  };

  const formatCurrency = (amount: number, currency: string = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatNextPayment = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
  };

  const renderSubscriptionItem = ({ item }: { item: Subscription }) => {
    const monthlyAmount =
      item.frequency === 'annual' ? item.amount / 12 : item.amount;

    return (
      <TouchableOpacity
        style={styles.subscriptionCard}
        onPress={() =>
          navigation.navigate('EditSubscription', { subscriptionId: item.id! })
        }
      >
        <View style={styles.subscriptionHeader}>
          <Text style={styles.subscriptionName}>{item.name}</Text>
          <TouchableOpacity
            onPress={() => handleDeleteSubscription(item.id!, item.name)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.subscriptionDetails}>
          <Text style={styles.amount}>
            {formatCurrency(item.amount, item.currency)}
            <Text style={styles.frequency}>
              {' '}
              / {item.frequency === 'monthly' ? 'mes' : 'año'}
            </Text>
          </Text>
          <Text style={styles.monthlyAmount}>
            {formatCurrency(monthlyAmount, item.currency)} mensual
          </Text>
        </View>

        <View style={styles.subscriptionFooter}>
          <Text style={styles.nextPayment}>
            Próximo pago: {formatNextPayment(item.next_payment_date)}
          </Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadSubscriptions}
        >
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total mensual</Text>
          <Text style={styles.totalAmount}>{formatCurrency(monthlyTotal)}</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSubscription')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {subscriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No tienes suscripciones aún</Text>
          <Text style={styles.emptySubtext}>
            Toca el botón + para agregar tu primera suscripción
          </Text>
        </View>
      ) : (
        <FlatList
          data={subscriptions}
          renderItem={renderSubscriptionItem}
          keyExtractor={(item) => item.id!.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  subscriptionDetails: {
    marginBottom: 12,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  frequency: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'normal',
  },
  monthlyAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  subscriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPayment: {
    fontSize: 14,
    color: '#666',
  },
  categoryBadge: {
    backgroundColor: '#007AFF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
