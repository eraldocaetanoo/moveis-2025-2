import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import api from '../../../../services/api';
import { useNavigation } from '@react-navigation/native';

export default function NewProduto() {
  
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');  
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const navigation = useNavigation();

  async function handleSave() {
    
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

    console.log('Enviando dados:', body);

    try {
      const response = await api.post('/produtos', body);
      
      Alert.alert('Sucesso', 'Produto criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('produtos/index');
            setNome('');
            setPreco('');
            setEstoqueMinimo('');
          }
        }
      ]);
      
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Não foi possível criar o produto.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text_email}>Nome do produto:</Text>
      <TextInput style={styles.input} placeholder="Nome do produto" onChangeText={setNome} value={nome}/>
      <Text style={styles.text_email}>Preço:</Text>
      <TextInput  style={styles.input} placeholder="0.00" onChangeText={setPreco} value={preco} keyboardType="decimal-pad"/>
      <Text style={styles.text_email}>Estoque Mínimo:</Text>
      <TextInput  style={styles.input} placeholder="Quantidade" onChangeText={setEstoqueMinimo} value={estoqueMinimo} keyboardType="number-pad"/>

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
      
            
        
    <StatusBar style="auto"/>
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