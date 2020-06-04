import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Not enough money for this transaction.', 400);
    }

    let foundCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!foundCategory) {
      foundCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(foundCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: foundCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
