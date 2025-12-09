import { Alert, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker'; 
import api from '../../../../services/api';
import { useNavigation } from '@react-navigation/native';

export default function NewVenda() {
  const navigation = useNavigation();

  // --- ESTADOS DE DADOS ---
  const [usersList, setUsersList] = useState([]);
  const [clientesList, setClientesList] = useState([]);
  const [produtosList, setProdutosList] = useState([]);

  // --- ESTADOS DA VENDA ---
  const [idUser, setIdUser] = useState('');
  const [idCliente, setIdCliente] = useState('');

  // --- ESTADOS DO ITEM ---
  const [idProduto, setIdProduto] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('');

  // --- CARRINHO ---
  const [itensVenda, setItensVenda] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersRes, clientesRes, produtosRes] = await Promise.all([
          api.get('/users'),      
          api.get('/clientes'),
          api.get('/produtos')
        ]);
        setUsersList(usersRes.data);
        setClientesList(clientesRes.data);
        setProdutosList(produtosRes.data);
      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Falha ao carregar dados de cadastro.");
      }
    }
    loadData();
  }, []);

  function handleSelectProduto(produtoId) {
    setIdProduto(produtoId);
    const produtoSelecionado = produtosList.find(p => p.id === produtoId);
    if (produtoSelecionado) {
      setPrecoUnitario(produtoSelecionado.preco ? produtoSelecionado.preco.toString() : '');
    } else {
      setPrecoUnitario('');
    }
  }

  function handleAddItem() {

    if (!idProduto || !quantidade || !precoUnitario) {
      Alert.alert('Atenção', 'Preencha todos os campos do item.');
      return;
    }

    const qtdParsed = parseInt(quantidade);
    const precoParsed = parseFloat(precoUnitario.toString().replace(',', '.'));

    if (isNaN(qtdParsed) || isNaN(precoParsed)) {
        Alert.alert('Erro', 'Quantidade ou Preço inválidos.');
        return;
    }

    const produtoRef = produtosList.find(p => p.id === idProduto);

    const novoItem = {
      idProduto: parseInt(idProduto),
      nomeProduto: produtoRef ? produtoRef.name : 'Produto Indefinido',
      quantidade: qtdParsed,
      precoUnitario: precoParsed,
      tempId: `${Date.now()}-${Math.floor(Math.random() * 10000)}` 
    };

    setItensVenda([...itensVenda, novoItem]);
    
    setIdProduto('');
    setQuantidade('');
    setPrecoUnitario('');
    Keyboard.dismiss();
  }

  function handleRemoveItem(idParaRemover) {
    Alert.alert(
      "Remover Item",
      "Tem certeza que deseja remover este item?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: 'destructive', 
          onPress: () => {
            setItensVenda(oldItens => oldItens.filter(item => item.tempId !== idParaRemover));
          }
        }
      ]
    );
  }

  async function handleSave() {
    if (!idUser || !idCliente) {
      Alert.alert('Erro', 'Vendedor e Cliente são obrigatórios.');
      return;
    }
    if (itensVenda.length === 0) {
      Alert.alert('Erro', 'A venda precisa ter pelo menos um item.');
      return;
    }

    const body = {
      idUser: parseInt(idUser),
      idCliente: parseInt(idCliente),
      itens: itensVenda.map(item => ({
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario
      }))
    };

    try {
      await api.post('/vendas', body);
      
      setItensVenda([]); 
      setIdUser('');      
      setIdCliente('');   
      
      Alert.alert('Sucesso', 'Venda realizada!');
      
      if(navigation.canGoBack()){
        navigation.navigate("venda/index");
      } else {
        navigation.navigate("venda/index"); 
      }
      
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar venda.');
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        
        <Text style={styles.headerTitle}>Nova Venda</Text>

        {/* SELEÇÃO DE VENDEDOR */}
        <Text style={styles.label}>Vendedor</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={idUser}
            onValueChange={(itemValue) => setIdUser(itemValue)}
          >
            <Picker.Item label="Selecione..." value="" color="#999" />
            {usersList.map(user => (
              <Picker.Item key={user.id} label={user.name} value={user.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Cliente</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={idCliente}
            onValueChange={(itemValue) => setIdCliente(itemValue)}
          >
            <Picker.Item label="Selecione..." value="" color="#999" />
            {clientesList.map(cli => (
              <Picker.Item key={cli.id} label={cli.name} value={cli.id} />
            ))}
          </Picker>
        </View>

        <View style={styles.separator} />
        <Text style={styles.subTitle}>Adicionar Itens</Text>

        {/* SELEÇÃO DE PRODUTO */}
        <Text style={styles.label}>Produto</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={idProduto}
            onValueChange={(itemValue) => handleSelectProduto(itemValue)}
          >
            <Picker.Item label="Selecione um produto..." value="" color="#999" />
            {produtosList.map(prod => {

               const val = prod.preco ? prod.preco : 0;
               const precoFormatado = new Intl.NumberFormat('pt-BR', {
                 style: 'currency', currency: 'BRL'
               }).format(val);

               return (
                 <Picker.Item 
                   key={prod.id} 
                   label={`${prod.name} - ${precoFormatado}`} 
                   value={prod.id} 
                 />
               );
            })}
          </Picker>
        </View>

        <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>Quantidade</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="0" 
                    keyboardType="numeric"
                    value={quantidade}
                    onChangeText={setQuantidade} 
                />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.label}>Preço Unit. (R$)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="0.00" 
                    keyboardType="numeric"
                    value={precoUnitario}
                    onChangeText={setPrecoUnitario} 
                />
            </View>
        </View>

        <TouchableOpacity style={styles.buttonAdd} onPress={handleAddItem}>
          <Text style={styles.textButtonAdd}>+ Adicionar Item</Text>
        </TouchableOpacity>

        {itensVenda.length > 0 && (
          <View style={{width: '90%', marginTop: 10}}>
             <Text style={{fontWeight: 'bold', marginBottom: 5}}>Itens no Carrinho ({itensVenda.length})</Text>
             
             {itensVenda.map((item) => (
               <View key={item.tempId} style={styles.itemRow}>
                 
                 <View style={{flex: 1}}>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>{item.nomeProduto}</Text>
                    <Text style={{color: '#666'}}>
                      {item.quantidade} x R$ {(Number(item.precoUnitario) || 0).toFixed(2)}
                    </Text>
                 </View>

                 <View style={{alignItems: 'flex-end'}}>
                    <Text style={{fontSize: 16, color: '#007AFF', fontWeight: 'bold', marginBottom: 5}}>
                      R$ {((Number(item.precoUnitario) || 0) * (Number(item.quantidade) || 0)).toFixed(2)}
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.deleteButton} 
                      onPress={() => handleRemoveItem(item.tempId)}
                    >
                      <Text style={styles.deleteText}>Excluir</Text>
                    </TouchableOpacity>
                 </View>

               </View>
             ))}
          </View>
        )}

        <View style={styles.separator} />

        <TouchableOpacity style={styles.buttonSave} onPress={handleSave}>
          <Text style={styles.textButtonSave}>FINALIZAR VENDA</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#007AFF'
  },
  label: {
    width: '90%',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  pickerContainer: {
    width: '90%',
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9'
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    width: '100%',
    marginBottom: 5
  },
  row: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  buttonAdd: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20
  },
  textButtonAdd: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 8
  },
  deleteButton: {
    backgroundColor: '#ffcccc',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ff0000',
    marginTop: 2
  },
  deleteText: {
    color: '#ff0000',
    fontSize: 12,
    fontWeight: 'bold'
  },
  separator: {
    height: 1,
    width: '90%',
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  buttonSave: {
    width: '90%',
    height: 55,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 2 
  },
  textButtonSave: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});