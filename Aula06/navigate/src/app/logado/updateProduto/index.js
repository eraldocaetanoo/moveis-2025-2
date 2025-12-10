import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';

export default function UpdateProduto() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState(''); 
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [id, setId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  
  const route = useRoute();
  const params = route.params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    console.log('ID do produto para editar:', params);
    
    if (params && params.id) {
      carregarProduto(params.id);
    } else {
      Alert.alert('Erro', 'ID do produto não fornecido.');
      navigation.goBack();
    }
  }, [isFocused]);

  const carregarProduto = async (produtoId) => {
    try {
      setCarregando(true);
      console.log('Buscando produto ID:', produtoId);
      
      const response = await api.get(`/produtos/${produtoId}`);
      const produtoData = response.data;
      
      console.log('Dados recebidos:', produtoData);
      
      setNome(produtoData.name || '');
      setPreco(produtoData.preco?.toString() || '');
      setEstoqueMinimo(produtoData.estoqueMinimo?.toString() || '');
      setId(produtoData.id);
      
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do produto.');
      navigation.goBack();
    } finally {
      setCarregando(false);
    }
  };

  const handleSave = async () => {
    // Validações
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome do produto é obrigatório!');
      return;
    }

    if (!preco || isNaN(parseFloat(preco)) || parseFloat(preco) <= 0) {
      Alert.alert('Erro', 'Preço inválido!');
      return;
    }

    const body = {
      name: nome,
      preco: parseFloat(preco),
      estoqueMinimo: estoqueMinimo ? parseInt(estoqueMinimo) : null
    };

    console.log('Atualizando produto ID:', id, 'com dados:', body);

    try {
      const response = await api.put(`/produtos/${id}`, body);
      
      Alert.alert(
        'Sucesso',
        'Produto atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('produtos/index');
            }
          }
        ]
      );
      
      console.log('Resposta da atualização:', response.data);
      
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      
      let mensagem = 'Não foi possível atualizar o produto.';
      if (error.response?.data?.message) {
        mensagem = error.response.data.message;
      }
      
      Alert.alert('Erro', mensagem);
    }
  };

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text style={styles.carregandoText}>Carregando produto...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Produto</Text>
      <Text style={styles.idText}>ID: {id}</Text>

      <Text style={styles.text_email}>Nome:</Text>
      <TextInput style={styles.input} value={nome} placeholder="Nome do produto" onChangeText={setNome}/>
      <Text style={styles.text_email}>Preço:</Text>
      <TextInput style={styles.input} value={preco} placeholder="0.00" onChangeText={setPreco} keyboardType="decimal-pad"/>
      <Text style={styles.text_email}>Estoque:</Text>
      <TextInput style={styles.input} value={estoqueMinimo} placeholder="Quantidade" onChangeText={setEstoqueMinimo} keyboardType="number-pad" />

      <View style={styles.buttonsContainer}>
        {/* Botão Cancelar adicionado */}
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.navigate('produtos/index')}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',  
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    width: '100%',
  },  
  text_email: {
    height: 40,
    marginBottom: -20,
    width: '100%',
  }, 
  // Container para os botões adicionado
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#ffff',
  },
  cancelButton: {
    backgroundColor: '#ffff',
  },
  buttonText: {
    color: '#333',
    fontWeight: '600',
  },
});