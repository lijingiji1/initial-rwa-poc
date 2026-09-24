import { Asset, AssetStatus } from '@/types';
import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const dashboardController = {
  // Get dashboard data including stats and filtered assets
  getDashboardData: async (req: Request, res: Response) => {
    try {
      const { searchQuery, filterType } = req.query;

      // Base query for assets
      let assetsQuery = prisma.asset.findMany({
        where: {
          AND: [
            searchQuery ? {
              OR: [
                { title: { contains: searchQuery as string, mode: 'insensitive' } },
                { description: { contains: searchQuery as string, mode: 'insensitive' } },
              ],
            } : {},
            filterType && filterType !== 'all' ? { category: filterType as string } : {},
          ],
        },
      });

      // Get stats
      const [assets, totalValue, pendingValidations, actionRequired] = await Promise.all([
        assetsQuery,
        prisma.asset.aggregate({
          _sum: { value: true },
        }),
        prisma.asset.count({
          where: { status: 'pending' },
        }),
        prisma.asset.count({
          where: { status: 'action_required' },
        }),
      ]);

      const stats = {
        totalAssets: assets.length,
        totalValue: totalValue._sum.value || 0,
        pendingValidations,
        actionRequired,
      };

      res.json({
        stats,
        assets,
      });
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  },

  // Get pending validations
  getPendingValidations: async (_req: Request, res: Response) => {
    try {
      const pendingAssets = await prisma.asset.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
      });

      res.json(pendingAssets);
    } catch (error) {
      console.error('Error in getPendingValidations:', error);
      res.status(500).json({ error: 'Failed to fetch pending validations' });
    }
  },

  // Get assets requiring action
  getActionRequired: async (_req: Request, res: Response) => {
    try {
      const actionRequiredAssets = await prisma.asset.findMany({
        where: { status: 'action_required' },
        orderBy: { updatedAt: 'desc' },
      });

      res.json(actionRequiredAssets);
    } catch (error) {
      console.error('Error in getActionRequired:', error);
      res.status(500).json({ error: 'Failed to fetch action required assets' });
    }
  },

  // Get total portfolio value
  getTotalValue: async (_req: Request, res: Response) => {
    try {
      const totalValue = await prisma.asset.aggregate({
        _sum: { value: true },
      });

      res.json({ totalValue: totalValue._sum.value || 0 });
    } catch (error) {
      console.error('Error in getTotalValue:', error);
      res.status(500).json({ error: 'Failed to fetch total value' });
    }
  },
};