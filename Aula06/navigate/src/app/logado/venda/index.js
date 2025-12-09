import { Alert, FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import api from '../../../../services/api'; 
import { useIsFocused, useNavigation } from '@react-navigation/native';

export default function Vendas() {
  const navigation = useNavigation();
  const [list, setList] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    carregarVendas();
  }, [isFocused]);

  async function carregarVendas() {
    try {
      const response = await api.get("/vendas");
      setList(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as vendas.');
      console.error(error);
    }
  }

  function handleDeleteVenda(id) {
    Alert.alert(
      "Excluir Venda",
      `Tem certeza que deseja excluir a venda #${id}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Excluir", 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/vendas/${id}`);
              setList(prevList => prevList.filter(item => item.id !== id));
              Alert.alert("Sucesso", "Venda excluída.");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir a venda.");
              console.error(error);
            }
          }
        }
      ]
    );
  }

  const calcularTotal = (itens) => {
    if (!itens) return 0;
    return itens.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <View style={styles.container}>
      
      {/* --- NOVO CABEÇALHO (Título + Botão) --- */}
      <View style={styles.headerContainer}>
          <Text style={styles.title}>Lista de Vendas</Text>
          
          <TouchableOpacity 
            style={styles.buttonNew}
            onPress={() => navigation.navigate("newVenda/index")}
          >
            <Text style={styles.buttonNewText}>+ Nova Venda</Text>
          </TouchableOpacity>
      </View>


      <FlatList 
        style={{ width: '100%' }}
        data={list}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => Alert.alert('Detalhes', `Venda para: ${item.Cliente?.name}`)}
            onLongPress={() => navigation.navigate("updateVenda/index", { id: item.id })}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Venda #{item.id}</Text>
                <Text style={styles.cardDate}>{formatarData(item.createdAt)}</Text>
              </View>
              
              <Text style={{marginBottom: 2}}>Cliente: {item.Cliente?.name || 'Cliente Removido'}</Text>
              <Text style={{marginBottom: 10}}>Vendedor: {item.User?.name || 'N/A'}</Text>
              
              <View style={styles.cardFooter}>
                  <Text style={styles.totalText}>
                    Total: R$ {calcularTotal(item.ItemVendas).toFixed(2)}
                  </Text>

                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleDeleteVenda(item.id)}
                  >
                    <Text style={styles.deleteText}>Excluir</Text>
                  </TouchableOpacity>
              </View>

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
    paddingTop: 40,
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonNew: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  buttonNewText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  card: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  cardDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 4
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  deleteButton: {
    backgroundColor: '#ffcccc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ff0000',
  },
  deleteText: {
    color: '#ff0000',
    fontSize: 12,
    fontWeight: 'bold'
  }
});