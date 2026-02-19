import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { Product, HistoryEntry } from '@/types'
import { triggerConfetti } from '@/lib/confetti'

interface SwagContextType {
  products: Product[]
  history: HistoryEntry[]
  collaborators: string[]
  withdrawItem: (
    productId: string,
    user: string,
    destination: string,
    date: Date,
  ) => void
  addProduct: (product: Omit<Product, 'id'>) => void
  isLoading: boolean
}

const SwagContext = createContext<SwagContextType | undefined>(undefined)

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Kit Onboarding Deluxe',
    category: 'RH',
    imageQuery: 'welcome kit gift box',
    stock: 12,
    description: 'Um kit completo para receber novos colaboradores com estilo.',
  },
  {
    id: '2',
    name: 'Garrafa Térmica Adapta',
    category: 'Institucional',
    imageQuery: 'water bottle insulated',
    stock: 4,
    description: 'Mantém sua bebida gelada por 24h ou quente por 12h.',
  },
  {
    id: '3',
    name: 'Caderno Moleskine Premium',
    category: 'Vendas',
    imageQuery: 'notebook black',
    stock: 25,
    description: 'Caderno de anotações de alta qualidade para suas ideias.',
  },
  {
    id: '4',
    name: 'Mochila Tech Anti-furto',
    category: 'Tech',
    imageQuery: 'backpack tech',
    stock: 0,
    description: 'Segurança e praticidade para transportar seus gadgets.',
  },
  {
    id: '5',
    name: 'Camiseta Algodão Egípcio',
    category: 'Institucional',
    imageQuery: 't-shirt black folded',
    stock: 8,
    description: 'Conforto inigualável com algodão de fibra longa.',
  },
  {
    id: '6',
    name: 'Powerbank Wireless 10k',
    category: 'Tech',
    imageQuery: 'powerbank wireless',
    stock: 3,
    description: 'Carregamento sem fio rápido para nunca ficar sem bateria.',
  },
  {
    id: '7',
    name: 'Copo Stanley Personalizado',
    category: 'Vendas',
    imageQuery: 'tumbler cup',
    stock: 15,
    description: 'O copo mais desejado do momento, com a marca da empresa.',
  },
  {
    id: '8',
    name: 'Boné Trucker Adapta',
    category: 'Marketing',
    imageQuery: 'cap trucker hat',
    stock: 2,
    description: 'Estilo despojado para eventos e dia a dia.',
  },
  {
    id: '9',
    name: 'Ecobag Sustentável',
    category: 'RH',
    imageQuery: 'tote bag canvas',
    stock: 30,
    description: 'Sacola ecológica resistente e versátil.',
  },
  {
    id: '10',
    name: 'Adesivos Pack Dev',
    category: 'Tech',
    imageQuery: 'laptop stickers',
    stock: 50,
    description: 'Pacote de adesivos variados para personalizar seu setup.',
  },
]

const INITIAL_COLLABORATORS = [
  'Allan Baptista',
  'Angelo Nuncio Pinheiro',
  'Arthur da Fonte Guerra',
  'Axel Ríos',
  'Ben Schulze',
  'Bia',
  'Braga',
  'Caio Filip Juliaci',
  'Davi Cunha',
  'Davy Pedrosa',
  'Edson Muniz',
  'Eduarda Almeida',
  'Eduardo Coelho',
  'Erica Ayumi',
  'Ezequiel',
  'Felipe Batista',
  'Felipe Mamede',
  'Felipe Navaar',
  'Felipe Oliveira Garcia',
  'Felipe Peixoto',
  'Fellipe Carvalho',
  'Fellipe Carvalho',
  'Fernando Mascarenhas',
  'Fernando Sousa',
  'Gabriel Carvalho',
  'Gabriel Henrique',
  'Gabriel Jesus',
  'Gabriel Pavão',
  'Gabriel Santos',
  'Giampaolo Lepore',
  'Guilherme Lago',
  'Guilherme Teofilo',
  'Gustavo Fonseca',
  'Hamú',
  'Ian Ede',
  'Ingrid Costa',
  'Isadora Magri',
  'Izabel Villyn',
  'Jadson Consolini',
  'Jamilson Scarcella',
  'Jessica Ferreira',
  'João Augusto',
  'João Ferrari',
  'João Locatelli',
  'João Vitor Andrade Estrela',
  'Joao Vitor Ferrari',
  'Juan Bonfim',
  'Julia Pereira Cruz',
  'Kaike Mota',
  'Kelvi Maycon',
  'Kelvin Dutra',
  'Kelvyn Holovecki',
  'Kimberly Prestes',
  'Léo Camargo',
  'Léo Marinho',
  'Lucas Andrade',
  'Lucas Bueno',
  'Lucas Dias',
  'Lucas Machado',
  'lucas paiva',
  'Lucas Pereira',
  'Lucas Richard',
  'Lucas Romcy',
  'Lucas Vin',
  'Lucas Yuri',
  'Luis Fernando',
  'Luis Miguel',
  'Lydia',
  'Márcia Ertel',
  'Marcos Cury',
  'Mateus Tápias',
  'Matheus Kubo',
  'Matheus Prado',
  'Matheus Sotto',
  'Max',
  'miguel',
  'Miguel Souza Dias',
  'Monike Leal',
  'Patrick Peters',
  'Paulo Zanquetta',
  'Priscilla Petry',
  'Rafael Cabral',
  'Raphael Araujo',
  'Raphaela Castro',
  'Rodrigo A. Santos',
  'Romario',
  'Ruan Azevedo',
  'Ruan Azevedo',
  'Samyla Vidal',
  'Tainara Oliveira',
  'Themila Andrade',
  'Thiago Machado',
  'Vinicius Galetti',
  'Yuri',
]

export function SwagProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [collaborators, setCollaborators] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load from local storage
    const loadData = () => {
      try {
        const storedProducts = localStorage.getItem('adapta-swag-products')
        const storedHistory = localStorage.getItem('adapta-swag-history')
        const storedCollaborators = localStorage.getItem(
          'adapta-swag-collaborators',
        )

        if (storedProducts) {
          setProducts(JSON.parse(storedProducts))
        } else {
          setProducts(INITIAL_PRODUCTS)
        }

        if (storedHistory) {
          setHistory(JSON.parse(storedHistory))
        }

        if (storedCollaborators) {
          setCollaborators(JSON.parse(storedCollaborators))
        } else {
          setCollaborators(INITIAL_COLLABORATORS)
        }
      } catch (error) {
        console.error('Failed to load data from local storage', error)
        setProducts(INITIAL_PRODUCTS)
        setCollaborators(INITIAL_COLLABORATORS)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('adapta-swag-products', JSON.stringify(products))
      localStorage.setItem('adapta-swag-history', JSON.stringify(history))
      localStorage.setItem(
        'adapta-swag-collaborators',
        JSON.stringify(collaborators),
      )
    }
  }, [products, history, collaborators, isLoading])

  const withdrawItem = (
    productId: string,
    user: string,
    destination: string,
    date: Date,
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock - 1) } : p,
      ),
    )

    const product = products.find((p) => p.id === productId)
    if (product) {
      const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        productId,
        productName: product.name,
        productImageQuery: product.imageQuery,
        user,
        destination,
        date: date.toISOString(),
      }
      setHistory((prev) => [newEntry, ...prev])
      triggerConfetti()
    }
  }

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
    }
    setProducts((prev) => [newProduct, ...prev])
  }

  return (
    <SwagContext.Provider
      value={{
        products,
        history,
        collaborators,
        withdrawItem,
        addProduct,
        isLoading,
      }}
    >
      {children}
    </SwagContext.Provider>
  )
}

export default function useSwagStore() {
  const context = useContext(SwagContext)
  if (context === undefined) {
    throw new Error('useSwagStore must be used within a SwagProvider')
  }
  return context
}
