import 'react-native-url-polyfill/auto';
import * as React from 'react';
import { useState } from 'react';
import { View, Button, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://libhxmtupqwemeevhhce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYmh4bXR1cHF3ZW1lZXZoaGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjU4MDYsImV4cCI6MjA1OTY0MTgwNn0.thcagWKXgBM0LNtpsRh8xo3TNn6vk9dPD_Qsc0kY1bM';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newEmpresa, setNewEmpresa] = useState({ name: '', street: '', phone: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchDataFromSupabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: fetchedData, error: supabaseError } = await supabase
        .from('empresa')
        .select('*')
        .order('id', { ascending: true });
      
      if (supabaseError) {
        console.error('Error en la consulta:', supabaseError);
        setError(`Error: ${supabaseError.message}`);
        return;
      }
      
      if (!fetchedData || fetchedData.length === 0) {
        console.log('No se encontraron datos');
        setError('No hay datos disponibles en la tabla empresa');
        return;
      }
      
      console.log('Datos obtenidos exitosamente:', fetchedData);
      setData(fetchedData);
    } catch (error) {
      console.error('Error inesperado:', error);
      setError(`Error inesperado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createEmpresa = async () => {
    if (!newEmpresa.name || !newEmpresa.street || !newEmpresa.phone) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const { data: insertedData, error } = await supabase
        .from('empresa')
        .insert([newEmpresa])
        .select();

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      setNewEmpresa({ name: '', street: '', phone: '' });
      fetchDataFromSupabase();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateEmpresa = async (id, updatedData) => {
    console.log("updatedData", updatedData);
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('empresa')
        .update(updatedData)
        .eq('id', id);

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      setEditingId(null);
      fetchDataFromSupabase();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEmpresa = async (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta empresa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase
                .from('empresa')
                .delete()
                .eq('id', id);

              if (error) {
                Alert.alert('Error', error.message);
                return;
              }

              fetchDataFromSupabase();
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderEmpresa = (item) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <View key={item.id} style={styles.item}>
          <TextInput
            style={styles.input}
            value={item.name}
            placeholderTextColor="grey"
            onChangeText={(text) => {
              const updatedData = [...data];
              const index = updatedData.findIndex(d => d.id === item.id);
              updatedData[index] = { ...item, name: text };
              setData(updatedData);
            }}
            placeholder="Nombre de la empresa"
          />
          <TextInput
            style={styles.input}
            value={item.street}
            placeholderTextColor="grey"
            onChangeText={(text) => {
              const updatedData = [...data];
              const index = updatedData.findIndex(d => d.id === item.id);
              updatedData[index] = { ...item, street: text };
              setData(updatedData);
            }}
            placeholder="Dirección"
          />
          <TextInput
            style={styles.input}
            value={item.phone}
            placeholderTextColor="grey"
            onChangeText={(text) => {
              const updatedData = [...data];
              const index = updatedData.findIndex(d => d.id === item.id);
              updatedData[index] = { ...item, phone: text };
              setData(updatedData);
            }}
            placeholder="Telefono"
          />
          <View style={styles.buttonRow}>
            <Button
              title="Guardar"
              onPress={() => updateEmpresa(item.id, {
                name: item.name,
                street: item.street,
                phone: item.phone
              })}
            />
            <Button
              title="Cancelar"
              onPress={() => {
                setEditingId(null);
                fetchDataFromSupabase();
              }}
              color="#666"
            />
          </View>
        </View>
      );
    }

    return (
      <View key={item.id} style={styles.item}>
        <Text style={styles.title}>Empresa: {item.name}</Text>
        <Text>Dirección: {item.street}</Text>
        <Text>ID: {item.id}</Text>
        <Text>Telefono: {item.phone}</Text>
        <Text>Creado: {new Date(item.created_at).toLocaleString()}</Text>
        <View style={styles.buttonRow}>
          <Button
            title="Editar"
            onPress={() => setEditingId(item.id)}
            color="#2196F3"
          />
          <Button
            title="Eliminar"
            onPress={() => deleteEmpresa(item.id)}
            color="#F44336"
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Cargando..." : "Obtener Datos"}
          onPress={fetchDataFromSupabase}
          disabled={loading}
        />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Agregar Nueva Empresa</Text>
        <TextInput
          style={styles.input}
          value={newEmpresa.name}
          onChangeText={(text) => setNewEmpresa({ ...newEmpresa, name: text })}
          placeholder="Nombre de la empresa"
          placeholderTextColor="grey"
        />
        <TextInput
          style={styles.input}
          value={newEmpresa.street}
          onChangeText={(text) => setNewEmpresa({ ...newEmpresa, street: text })}
          placeholder="Dirección"
          placeholderTextColor="grey"
        />
        <TextInput
          style={styles.input}
          value={newEmpresa.phone}
          onChangeText={(text) => setNewEmpresa({ ...newEmpresa, phone: text })}
          placeholder="Teléfono"
          placeholderTextColor="grey"
        />
        <Button
          title="Agregar Empresa"
          onPress={createEmpresa}
          disabled={loading}
        />
      </View>
      
      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
      
      {data.length > 0 && (
        <View style={styles.dataContainer}>
          {data.map(renderEmpresa)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    padding: 20,
    marginTop: 20,
  },
  dataContainer: {
    padding: 20,
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 20,
    borderRadius: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  error: {
    margin: 20,
    padding: 10,
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: 5,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});