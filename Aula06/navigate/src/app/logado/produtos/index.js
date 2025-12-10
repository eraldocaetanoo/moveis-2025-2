import { StatusBar } from 'expo-status-bar';
import { Alert, FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../../services/api';
import { useIsFocused, useNavigation } from '@react-navigation/native';

export default function Produtos() {
  const navigation = useNavigation();

  function handleSelectProduto(item) {
    Alert.alert('Produto Selecionado', `Você selecionou o produto: ${item.name}`);
  }
  const [list, setList] = useState([]);
  const isFocused = useIsFocused();

  const [produto, setProduto] = useState({
    "id": 1,
    "name": "",
    "preco": "",
    "estoqueMinimo": ""
  });
  useEffect(() => {
    api.get("/produtos").then(response => {
      setList(response.data)

    }).catch(error => {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
      console.error(error);
    });

    setProduto({
      "id": 1,
      "name": "Produto Exemplo",
      "preco": "29.90",
      "estoqueMinimo": "10"
    });
  
  }, [isFocused]); // Effect runs when 'count' changes

  // Função para formatar preço
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(preco));
  };

  // Função para mostrar alerta com opções Editar/Excluir
  const mostrarOpcoesProduto = (item) => {
    Alert.alert(
      'Opções do Produto',
      `Produto: ${item.name}\nPreço: ${formatarPreco(item.preco)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Editar', 
          onPress: () => {
            navigation.navigate("updateProduto/index", { id: item.id });
          }
        },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => excluirProduto(item.id, item.name)
        }
      ]
    );
  };

  
  const excluirProduto = (id, nome) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o produto "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/produtos/${id}`);
              Alert.alert('Sucesso', 'Produto excluído com sucesso!');
              
              const response = await api.get("/produtos");
              setList(response.data);
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir o produto.');
            }
          }
        }
      ]
    );
  };

  return (

    <View style={styles.container}>


      <FlatList style={{ width: '100%' }}
        data={list}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity  
            onLongPress={() => {
              mostrarOpcoesProduto(item);  // Alterado: chama função de alerta
            }}
            onPress={() => Alert.alert('Produto Selecionado', `Você selecionou o produto: ${item.name}`)}>
            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
              <Text>Preço: {formatarPreco(item.preco)}</Text>
              <Text>Estoque Mínimo: {item.estoqueMinimo || "Não informado"}</Text>
              {item.descricao && <Text>Descrição: {item.descricao}</Text>}
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