import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import { useSubscriptionStore } from '../store/subscriptionStore';

const screenWidth = Dimensions.get('window').width;

const CHART_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#FF6384',
  '#C9CBCF',
];

export default function StatsScreen() {
  const { subscriptions, getMonthlyTotal, getSubscriptionsByCategory } =
    useSubscriptionStore();
  const [categoryData, setCategoryData] = useState<
    { category: string; total: number }[]
  >([]);

  useEffect(() => {
    loadCategoryData();
  }, [subscriptions]);

  const loadCategoryData = async () => {
    const data = await getSubscriptionsByCategory();
    setCategoryData(data);
  };

  const monthlyTotal = getMonthlyTotal();
  const totalSubscriptions = subscriptions.length;

  const chartData = categoryData.map((item, index) => ({
    name: item.category,
    population: item.total,
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const getFrequencyStats = () => {
    const monthly = subscriptions.filter(
      (sub) => sub.frequency === 'monthly'
    ).length;
    const annual = subscriptions.filter(
      (sub) => sub.frequency === 'annual'
    ).length;
    return { monthly, annual };
  };

  const frequencyStats = getFrequencyStats();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen General</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalSubscriptions}</Text>
            <Text style={styles.summaryLabel}>Suscripciones</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {formatCurrency(monthlyTotal)}
            </Text>
            <Text style={styles.summaryLabel}>Total mensual</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {formatCurrency(monthlyTotal * 12)}
            </Text>
            <Text style={styles.summaryLabel}>Total anual</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {totalSubscriptions > 0
                ? formatCurrency(monthlyTotal / totalSubscriptions)
                : '$0'}
            </Text>
            <Text style={styles.summaryLabel}>Promedio por sub.</Text>
          </View>
        </View>
      </View>

      {chartData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Gastos por Categoría</Text>
          <PieChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute
          />
        </View>
      )}

      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Detalles por Categoría</Text>
        {categoryData.map((item, index) => (
          <View key={item.category} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <View
                style={[
                  styles.categoryColor,
                  {
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  },
                ]}
              />
              <Text style={styles.categoryName}>{item.category}</Text>
            </View>
            <Text style={styles.categoryAmount}>
              {formatCurrency(item.total)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.frequencyCard}>
        <Text style={styles.frequencyTitle}>Frecuencia de Pagos</Text>
        <View style={styles.frequencyRow}>
          <View style={styles.frequencyItem}>
            <Text style={styles.frequencyValue}>{frequencyStats.monthly}</Text>
            <Text style={styles.frequencyLabel}>Mensuales</Text>
          </View>
          <View style={styles.frequencyItem}>
            <Text style={styles.frequencyValue}>{frequencyStats.annual}</Text>
            <Text style={styles.frequencyLabel}>Anuales</Text>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  frequencyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  frequencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  frequencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  frequencyItem: {
    alignItems: 'center',
  },
  frequencyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  frequencyLabel: {
    fontSize: 14,
    color: '#666',
  },
  spacer: {
    height: 20,
  },
});
