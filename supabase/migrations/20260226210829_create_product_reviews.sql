-- Create product_reviews table
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES items(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert mock feedback for demonstration
DO $$
DECLARE
  dept_id UUID;
  emp_id UUID;
  item_id UUID;
BEGIN
  -- 1. Ensure 'Design' department exists
  INSERT INTO departments (name) VALUES ('Design') ON CONFLICT (name) DO NOTHING;
  SELECT id INTO dept_id FROM departments WHERE name = 'Design';

  -- 2. Ensure 'Gabriel' user exists for the review
  INSERT INTO employees (name, email, department_id, role, avatar_url)
  VALUES ('Gabriel', 'gabriel.design@adapta.org', dept_id, 'Designer', 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=gabriel')
  ON CONFLICT (email) DO UPDATE 
  SET department_id = EXCLUDED.department_id, name = EXCLUDED.name;
  
  SELECT id INTO emp_id FROM employees WHERE email = 'gabriel.design@adapta.org';

  -- 3. Select an item to attach the review to (preferably clothing)
  SELECT id INTO item_id FROM items WHERE category = 'Vestuário' LIMIT 1;
  IF item_id IS NULL THEN
    SELECT id INTO item_id FROM items LIMIT 1;
  END IF;

  -- 4. Insert the mock review
  IF item_id IS NOT NULL AND emp_id IS NOT NULL THEN
    INSERT INTO product_reviews (product_id, employee_id, rating, comment)
    VALUES (
      item_id, 
      emp_id, 
      5, 
      'A qualidade da jaqueta é incrível, mas a forma é um pouco justa. Se você gosta de roupas mais folgadas, recomendo pegar um tamanho acima do seu padrão.'
    );
  END IF;
END $$;
