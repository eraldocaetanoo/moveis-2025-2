import { StatusBar } from 'expo-status-bar';
import { Alert, FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../../services/api';
import { useIsFocused, useNavigation } from '@react-navigation/native';

export default function Cliente() {
  const navigation = useNavigation();

  function handleSelectCliente(item) {
    Alert.alert('Cliente Selecionado', `Você selecionou o cliente: ${item.name}`);
  }
  const [list, setList] = useState([]);
  const isFocused = useIsFocused();

  const [cliente, setClient] = useState({
    "id": 1,
    "name": "",
    "email": "",
    "password": "",
    "endereco": ""
  });
  useEffect(() => {
    api.get("/clientes").then(response => {
      setList(response.data)

    }).catch(error => {
      Alert.alert('Erro', 'Não foi possível carregar os dados do cliente.');
      console.error(error);
    });

    setClient({
      "id": 1,
      "name": "Mateus",
      "email": "metrixmax@gmail.com",
      "password": "",
      "endereco": "Rua A, 123"
    });
  
  }, [isFocused]); // Effect runs when 'count' changes

  return (

    <View style={styles.container}>


      <FlatList style={{ width: '100%' }}
        data={list}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity  onLongPress={() => {
            Alert.alert('Cliente Selecionado', `Você selecionou o cliente: ${item.id}`)
            navigation.navigate("updateClient/index", { id: item.id });
          }}
            onPress={() => Alert.alert('Cliente Selecionado', `Você selecionou o cliente: ${item.name}`)}>
            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
              <Text>Telefone: {item.phone}</Text>
              <Text>Endereço: {item.endereco}</Text>
              <Text>Email: {item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
